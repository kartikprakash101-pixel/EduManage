import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  ShieldCheck,
  Server,
  Key,
  CheckSquare,
  HelpCircle,
  Copy,
  Check,
  FileCode,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export const DocsAndSetupView: React.FC = () => {
  const { currentLanguage, showToast } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const postgresSchema = `-- ========================================================
-- EDUMANAGE PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Multi-Tenant Coaching Architecture with Row Level Security (RLS)
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Institutes Table (Multi-Coaching Tenants)
CREATE TABLE institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    tagline TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gst_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users Table (Role-Based Access: owner, teacher, accountant, parent)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'teacher', 'accountant', 'parent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Students Table (Classes 6-12)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    admission_no VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    class_grade VARCHAR(50) NOT NULL,
    stream VARCHAR(50) DEFAULT 'General',
    gender VARCHAR(20),
    dob DATE,
    phone VARCHAR(20),
    guardian_name VARCHAR(255) NOT NULL,
    guardian_relation VARCHAR(50) DEFAULT 'Father',
    guardian_phone VARCHAR(20) NOT NULL,
    address TEXT,
    total_agreed_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_roll_per_institute UNIQUE (institute_id, class_grade, roll_no)
);

-- 5. Fee Payments Table
CREATE TABLE fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    receipt_no VARCHAR(100) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Bank Transfer', 'Cheque')),
    reference_no VARCHAR(255),
    month_or_term VARCHAR(255) NOT NULL,
    collected_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Attendance Table
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by VARCHAR(255) NOT NULL,
    remark TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_attendance_session UNIQUE (institute_id, student_id, date)
);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Multi-Tenant Isolation Policy: Users only access their own institute's data
CREATE POLICY tenant_isolation_students ON students
    FOR ALL
    USING (institute_id = (auth.jwt() ->> 'institute_id')::UUID);

CREATE POLICY tenant_isolation_fees ON fee_payments
    FOR ALL
    USING (institute_id = (auth.jwt() ->> 'institute_id')::UUID);

CREATE POLICY tenant_isolation_attendance ON attendance_records
    FOR ALL
    USING (institute_id = (auth.jwt() ->> 'institute_id')::UUID);
`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Architecture, Database Schema & Beginner Deployment Guide
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Complete production blueprint for scaling EduManage from ₹0 initial budget to commercial SaaS.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="space-y-6 text-xs">
        {/* 1. Production PostgreSQL & RLS Schema */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900">
                1. Production Database Schema (PostgreSQL DDL + Supabase RLS)
              </h2>
            </div>
            <button
              onClick={() => copyToClipboard(postgresSchema, 'schema')}
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1 font-medium"
            >
              {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'schema' ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <p className="text-slate-600 leading-relaxed">
            This schema includes relational constraints, foreign keys, unique roll numbers per class, audit columns, and Row Level Security (RLS) policies guaranteeing that no coaching institute can ever access or view another institute's student or financial records.
          </p>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
            {postgresSchema}
          </pre>
        </div>

        {/* 2. Exact Local Run & Setup Instructions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              2. Local Setup Instructions for Beginners (₹0 Budget)
            </h2>
          </div>

          <p className="text-slate-600 leading-relaxed">
            If you have no prior coding knowledge, follow these exact 4 steps in your terminal to run EduManage on your computer:
          </p>

          <div className="space-y-2.5 font-mono text-[11px]">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-1"># Step 1: Clone and navigate to repository</span>
              <div className="text-slate-900 font-bold">git clone https://github.com/your-username/edumanage.git</div>
              <div className="text-slate-900 font-bold">cd edumanage</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-1"># Step 2: Install dependencies (Express, React 19, Gemini SDK, Tailwind)</span>
              <div className="text-slate-900 font-bold">npm install</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-1"># Step 3: Configure Environment Variables</span>
              <div className="text-slate-900 font-bold">cp .env.example .env</div>
              <span className="text-slate-500 font-sans block text-xs mt-1">
                Add your free GEMINI_API_KEY from Google AI Studio into .env.
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-1"># Step 4: Start local development server</span>
              <div className="text-slate-900 font-bold">npm run dev</div>
              <span className="text-emerald-700 font-sans block text-xs mt-1">
                Open http://localhost:3000 in Chrome or Edge to view your live coaching platform!
              </span>
            </div>
          </div>
        </div>

        {/* 3. Free Hosting Deployment Blueprint (Vercel + Render + Supabase) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              3. Free Hosting & Cloud Deployment Blueprint (₹0 Monthly Cost)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="font-bold text-slate-900 text-xs">1. Database: Supabase</div>
              <div className="text-[11px] text-slate-600">
                • 500MB PostgreSQL free tier (holds over 50,000 student records).
                <br />• Built-in Auth, Row Level Security & automatic daily backups.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="font-bold text-slate-900 text-xs">2. Backend / Express: Render</div>
              <div className="text-[11px] text-slate-600">
                • Free Web Service tier hosting Node.js server.
                <br />• Connects GitHub repo with automated CI/CD deployments.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="font-bold text-slate-900 text-xs">3. Frontend: Vercel / Cloudflare</div>
              <div className="text-[11px] text-slate-600">
                • Free global edge CDN for instantaneous load speeds across India.
                <br />• Free SSL HTTPS certificate automatically provisioned.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Features: Working Now vs External Services Required */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              4. Features Status Matrix: Working In Prototype vs External Services
            </h2>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Status In EduManage MVP</th>
                  <th className="py-2.5 px-3">External Service Required For Production</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Student Admissions & Directory</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">100% Fully Functional</td>
                  <td className="py-2.5 px-3 text-slate-500">PostgreSQL / Supabase Database</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Fee Recording & Receipts</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">100% Fully Functional (Manual Cash/UPI)</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    Razorpay / Cashfree (for automated online student card/UPI checkout)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Attendance Marking Register</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">100% Fully Functional</td>
                  <td className="py-2.5 px-3 text-slate-500">None required (Works out of the box)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">CBSE Examinations & Rank Ties</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">100% Fully Functional</td>
                  <td className="py-2.5 px-3 text-slate-500">None required (Pure deterministic math)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">AI Quiz & Remarks Generator</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">100% Functional via Gemini 3.8 Flash</td>
                  <td className="py-2.5 px-3 text-slate-500">Google AI Studio API Key (Free tier available)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Parent WhatsApp / SMS Reminders</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">100% Functional (Direct WhatsApp Link)</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    Twilio / Fast2SMS / Gupshup (if automated background bulk SMS without clicking is desired)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Reports & CSV Export</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">100% Fully Functional</td>
                  <td className="py-2.5 px-3 text-slate-500">Direct client-side CSV blob download</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Security & DPDP Act India Compliance Checklist */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              5. Security & Privacy Checklist Before Using Real Student Records
            </h2>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Under India's Digital Personal Data Protection (DPDP) Act 2023, student records for minors (under 18) require stringent protection:
          </p>

          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Parental Consent:</strong> Ensure parents sign a physical or digital consent form allowing coaching institutes to store contact numbers and test marks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>No Public Exposure:</strong> Never post full marks registers with student phone numbers or residential addresses on public websites or unprotected noticeboards.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Role Separation:</strong> Faculty should not see student home addresses or parental financial balances; Accountants should not alter exam marks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Audit Logging:</strong> Keep logs of every student edit or fee receipt generation to identify inadvertent data entry errors.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
