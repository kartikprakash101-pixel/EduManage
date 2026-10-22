import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI if key is real and valid
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 15) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Generate Teacher Remarks for Student Report Card
app.post('/api/ai/report-remarks', async (req: Request, res: Response) => {
  try {
    const { studentName, classGrade, percentage, grade, subjects, attendanceRate, language } = req.body;

    const isHindi = language === 'hi';
    const subjectsText = Array.isArray(subjects)
      ? subjects.map((s: { subject: string; obtainedMarks: number; maxMarks: number }) => `${s.subject}: ${s.obtainedMarks}/${s.maxMarks}`).join(', ')
      : 'Core subjects';

    if (!aiClient) {
      // High-quality deterministic fallback if no API key
      const fallbackRemark = isHindi
        ? `${studentName} ने ${percentage}% अंक प्राप्त कर संतोषजनक प्रदर्शन किया है। कक्षा में उपस्थिति ${attendanceRate}% है। कमजोर विषयों में निरंतर अभ्यास से और बेहतर परिणाम प्राप्त किए जा सकते हैं।`
        : `${studentName} has demonstrated commendable effort with ${percentage}% (${grade}). With an attendance of ${attendanceRate}%, maintaining steady consistency in daily problem-solving will further elevate academic excellence.`;
      
      const fallbackTips = isHindi
        ? ['प्रतिदिन 1 घंटा गणित और विज्ञान के सूत्रों का अभ्यास करें।', 'संदेह होने पर तुरंत शिक्षकों से पूछें।', 'नियमित रूप से पिछले वर्षों के प्रश्न हल करें।']
        : ['Dedicate 45 minutes daily to numerical problem solving.', 'Revise weak chapters identified in unit tests.', 'Maintain regular revision notes and formula sheets.'];

      return res.json({ remarks: fallbackRemark, actionTips: fallbackTips });
    }

    const prompt = `You are a senior coaching institute teacher in India evaluating a ${classGrade} student named ${studentName}.
Student details:
- Aggregate Percentage: ${percentage}% (CBSE Grade: ${grade})
- Subject Marks: ${subjectsText}
- Attendance: ${attendanceRate}%
Language requested: ${isHindi ? 'Hindi (हिंदी script)' : 'English'}

Provide:
1. A warm, constructive, highly professional teacher's remark (2-3 sentences) suitable for an official coaching report card.
2. Three specific, actionable study tips for the student and parents.

Return JSON in this format:
{
  "remarks": "string",
  "actionTips": ["string", "string", "string"]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      remarks: parsed.remarks || 'Diligent effort shown throughout the term.',
      actionTips: parsed.actionTips || ['Regular revision recommended.'],
    });
  } catch (error) {
    console.error('Error generating report remarks:', error);
    return res.json({
      remarks: 'Student has demonstrated commendable consistency. Regular problem-solving and test revision recommended for continued academic excellence.',
      actionTips: ['Revise core formulas daily', 'Practice previous year board question papers', 'Seek timely doubt clearance'],
    });
  }
});

// 2. Generate Practice Quiz / Test Paper for Classes 6-12
app.post('/api/ai/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { classGrade, subject, topic, questionCount = 5, difficulty = 'Medium', language } = req.body;
    const isHindi = language === 'hi';

    if (!aiClient) {
      // High-quality mock questions for Indian syllabus (CBSE/State Board)
      const mockQuestions = [
        {
          id: 1,
          question: isHindi
            ? `${classGrade} ${subject} (${topic}): सही विकल्प चुनें या संक्षेप में उत्तर दें।`
            : `For ${classGrade} ${subject} on ${topic}: Define key concepts and choose the correct option.`,
          options: isHindi
            ? ['A) विकल्प 1 - मुख्य सिद्धांत', 'B) विकल्प 2 - वैकल्पिक नियम', 'C) विकल्प 3 - अपवाद', 'D) इनमें से कोई नहीं']
            : ['A) Principle formulation', 'B) Derived equilibrium', 'C) Empirical exception', 'D) None of these'],
          correctAnswer: 'A',
          explanation: isHindi ? 'यह मूलभूत नियम के अनुसार सत्य है।' : 'Based on fundamental syllabus postulates.',
          marks: 2,
        },
        {
          id: 2,
          question: isHindi
            ? 'इस विषय के मुख्य अनुप्रयोगों का संक्षेप में उल्लेख करें।'
            : 'Explain the primary practical application of this topic in daily life or engineering/science.',
          options: [],
          correctAnswer: 'Direct concept definition and 2 bullet points.',
          explanation: 'Clear application and step-by-step reasoning.',
          marks: 3,
        },
      ];

      return res.json({
        title: `${classGrade} ${subject} — ${topic} Test`,
        totalMarks: 10,
        questions: mockQuestions,
      });
    }

    const prompt = `Generate a coaching class test paper for ${classGrade} Indian students studying ${subject}.
Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: ${questionCount}
Language: ${isHindi ? 'Hindi' : 'English'}

Provide a structured test paper with a title, totalMarks, and an array of questions. Each question must include:
- id (number)
- question (string)
- options (array of 4 strings for MCQ, or empty array if short subjective question)
- correctAnswer (string)
- explanation (string)
- marks (number)

Output valid JSON matching this schema:
{
  "title": "string",
  "totalMarks": number,
  "questions": [
    {
      "id": number,
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string",
      "marks": number
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return res.json({
      title: `${req.body.classGrade || 'Class 10'} ${req.body.subject || 'Mathematics'} — ${req.body.topic || 'Practice'} Test Paper`,
      totalMarks: 25,
      questions: [
        {
          id: 1,
          question: `Find the discriminant and nature of roots for a quadratic equation in ${req.body.topic || 'this topic'}.`,
          options: ['A) Real and distinct roots (D > 0)', 'B) Real and equal roots (D = 0)', 'C) Complex conjugate roots (D < 0)', 'D) Undefined'],
          correctAnswer: 'A',
          explanation: 'When discriminant b^2 - 4ac > 0, roots are real and unequal.',
          marks: 2,
        },
        {
          id: 2,
          question: 'Define the standard condition for three consecutive terms to be in Arithmetic Progression (AP).',
          options: ['A) 2b = a + c', 'B) b^2 = ac', 'C) b = a - c', 'D) None of these'],
          correctAnswer: 'A',
          explanation: 'In AP with terms a, b, c, the common difference d = b - a = c - b, hence 2b = a + c.',
          marks: 2,
        },
        {
          id: 3,
          question: 'Solve for x: x^2 - 5x + 6 = 0 by factorisation method. Show both intermediate factors.',
          options: [],
          correctAnswer: 'x = 2 and x = 3',
          explanation: '(x - 2)(x - 3) = 0 yields solutions x = 2 and x = 3.',
          marks: 3,
        },
      ],
    });
  }
});

// 3. Generate Fee Follow-up Reminder Message (WhatsApp / SMS)
app.post('/api/ai/fee-reminder', async (req: Request, res: Response) => {
  try {
    const { studentName, classGrade, guardianName, pendingAmount, dueDate, instituteName, language, tone = 'polite' } = req.body;
    const isHindi = language === 'hi';

    if (!aiClient) {
      const message = isHindi
        ? `आदरणीय ${guardianName} जी, सादर प्रणाम। ${instituteName} की ओर से विनम्र निवेदन है कि ${studentName} (${classGrade}) की बकाया कोचिंग फीस ₹${pendingAmount} की अंतिम तिथि ${dueDate} है। कृपया समय पर भुगतान कर सहयोग करें। सहायता हेतु संस्थान से संपर्क करें। सधन्यवाद!`
        : `Dear ${guardianName}, Greetings from ${instituteName}. This is a gentle reminder that the pending tuition fee of ₹${pendingAmount} for ${studentName} (${classGrade}) is due by ${dueDate}. Kindly clear the dues at your earliest convenience to ensure uninterrupted classes. For any queries or receipt confirmation, feel free to contact our office. Thank you!`;

      return res.json({ message });
    }

    const prompt = `Write a ${tone} fee reminder message for a parent from an Indian coaching institute.
Details:
- Parent: ${guardianName}
- Student: ${studentName} (${classGrade})
- Pending Fee Amount: ₹${pendingAmount}
- Due Date: ${dueDate}
- Institute Name: ${instituteName}
- Language: ${isHindi ? 'Hindi (हिंदी script)' : 'English'}

The message should be polite, respectful, and suitable for WhatsApp or SMS. It must clearly specify the pending amount and due date without sounding harsh.
Output JSON:
{
  "message": "string"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ message: parsed.message || 'Fee reminder generated.' });
  } catch (error) {
    console.error('Error generating fee reminder:', error);
    return res.status(500).json({ error: 'Fee reminder generation failed' });
  }
});

// Mount Vite middleware in development
async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduManage server running at http://localhost:${PORT}`);
  });
}

start();
