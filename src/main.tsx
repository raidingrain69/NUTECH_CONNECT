import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import confetti from 'canvas-confetti';
import Tesseract from 'tesseract.js';
import { 
  Compass, 
  Calendar, 
  Calculator, 
  MessageSquare, 
  FileText, 
  LogOut, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff, 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  Image as ImageIcon,
  X,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  Camera,
  ScanLine,
  CameraOff,
  ShieldCheck
} from 'lucide-react';
import './index.css';

// --- DATA TYPES ---
interface Post {
  id: number;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: number;
  likes: number;
  commentsCount: number;
  isLiked?: boolean;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  isFromScreenshot?: boolean;
}

interface CalculatorCourse {
  id: number;
  semester: number;
  courseName: string;
  creditHours: number;
  grade: string;
  gradePoints: number;
}

interface ChatMessage {
  id: number;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: number;
}

interface UserProfile {
  email: string;
  name: string;
  isUniversityStudent: boolean;
  batch: string;
  department: string;
  rollNumber: string;
  authType: 'Email' | 'Email_OTP' | 'Google' | 'ID_QR';
}

interface ClassChatMessage {
  id: number;
  sender: string;
  text: string;
  timestamp: number;
}

interface ParsedCardProfile {
  profile: UserProfile;
  format: string;
}

interface NotificationBannerState {
  title: string;
  message: string;
  duration?: number;
}

type HubSectionId = 'topics' | 'announcements' | 'resources' | 'events' | 'internships' | 'mentors' | 'marketplace' | 'lost-found' | 'projects' | 'picks';

interface HubSection {
  id: HubSectionId;
  label: string;
  description: string;
}

interface EventCard {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  seats: number;
  attendees: number;
  summary: string;
  details: string;
  image: string;
  attendance?: 'attend' | 'skip';
}

interface InternshipCard {
  id: number;
  company: string;
  role: string;
  deadline: string;
  status: 'Applied' | 'Saved' | 'Interview' | 'Offer';
  likes: number;
  summary: string;
  type: 'Internship' | 'Job';
}

interface MentorCard {
  id: number;
  topic: string;
  preferredMentor: string;
  status: 'Matched' | 'Requested' | 'In Progress';
  senior: string;
  expertise: string;
}

interface EventRsvp {
  eventId: number;
  status: 'Going' | 'Maybe' | 'Interested';
}

interface InternshipApplication {
  id: number;
  company: string;
  role: string;
  deadline: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer';
  link?: string;
}

interface MentorRequest {
  id: number;
  topic: string;
  preferredMentor: string;
  status: 'Requested' | 'Matched' | 'In Progress';
}

interface MarketplaceListing {
  id: number;
  title: string;
  seller: string;
  pricePKR: number;
  description: string;
}

interface LostFoundItem {
  id: number;
  title: string;
  type: 'Lost' | 'Found';
  location: string;
  description: string;
}

interface ProjectShare {
  id: number;
  title: string;
  owner: string;
  link: string;
  summary: string;
}

interface PickItem {
  id: number;
  title: string;
  category: string;
  notes: string;
}

// --- DEMO INITIAL DATA ---
const DEMO_POSTS: Post[] = [
  {
    id: 1,
    authorName: "Haris Ali",
    authorRole: "Student (Semester 4)",
    content: "Hey guys, I heard from some group that midterms are delayed to next Tuesday. Is this true or can someone confirm? #Exams",
    timestamp: Date.now() - 30 * 60 * 1000,
    likes: 4,
    commentsCount: 2
  },
  {
    id: 2,
    authorName: "Zainab Shah",
    authorRole: "Student (Semester 2)",
    content: "Selling my semester 3 Operating Systems and Data Structures textbook. In pristine condition. Asking for Rs. 800. DM me if interested in purchasing!",
    timestamp: Date.now() - 120 * 60 * 1000,
    likes: 2,
    commentsCount: 1
  },
  {
    id: 3,
    authorName: "Admin Office",
    authorRole: "Registrar Department",
    content: "Fee submission deadline for the Spring Semester closes tomorrow at 4:00 PM. Please clear your dues immediately to avoid late submission penalties. #Admin #Deadlines",
    timestamp: Date.now() - 240 * 60 * 1000,
    likes: 15,
    commentsCount: 0
  },
  {
    id: 4,
    authorName: "Muhammad Usman",
    authorRole: "Student (Semester 3)",
    content: "Found a room key with a red lanyard in the cafeteria ground floor near the main counter. I have handed it over to the Student Affairs Desk in Academic Block A. #Admin",
    timestamp: Date.now() - 400 * 60 * 1000,
    likes: 6,
    commentsCount: 3
  },
  {
    id: 5,
    authorName: "Amna Batool",
    authorRole: "Student (Semester 1)",
    content: "Starting a study group for programming fundamentals final prep. We will meet on Friday at 2 PM in the library. Let me know if you want to join!",
    timestamp: Date.now() - 600 * 60 * 1000,
    likes: 8,
    commentsCount: 5
  }
];

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: "CS-201 Data Structures Lab",
    date: "July 15, 2026",
    time: "09:00 AM - 11:00 AM",
    location: "Lab 1, NUSIT Building"
  },
  {
    id: 2,
    title: "CS-202 Software Engineering Lecture",
    date: "July 15, 2026",
    time: "1:00 PM - 2:30 PM",
    location: "Classroom 3, Academic Block B"
  }
];

const PREDEFINED_COURSES: Record<number, { name: string; credits: number }[]> = {
  1: [
    { name: "Introduction to ICT", credits: 3 },
    { name: "Programming Fundamentals", credits: 4 },
    { name: "Calculus & Analytical Geometry", credits: 3 },
    { name: "Applied Physics", credits: 3 },
    { name: "English Composition", credits: 3 }
  ],
  2: [
    { name: "Object Oriented Programming", credits: 4 },
    { name: "Digital Logic Design", credits: 4 },
    { name: "Discrete Structures", credits: 3 },
    { name: "Communication Skills", credits: 3 },
    { name: "Islamic Studies", credits: 2 }
  ],
  3: [
    { name: "Data Structures & Algorithms", credits: 4 },
    { name: "Computer Organization & Assembly Language", credits: 4 },
    { name: "Linear Algebra", credits: 3 },
    { name: "Professional Practices", credits: 3 },
    { name: "Pakistan Studies", credits: 2 }
  ],
  4: [
    { name: "Database Systems", credits: 4 },
    { name: "Operating Systems", credits: 4 },
    { name: "Software Engineering", credits: 3 },
    { name: "Probability & Statistics", credits: 3 },
    { name: "Technical & Business Writing", credits: 3 }
  ]
};

const DEPARTMENTS = ["Cyber Security", "Computer Science", "Software Engineering"];

const VITE_GEMINI_API_KEY = (import.meta.env as Record<string, string>).VITE_GEMINI_API_KEY as string | undefined;

function getGeminiApiKey() {
  return VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY') || '';
}

function makeEventPoster(title: string, subtitle: string, startColor: string, endColor: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${startColor}"/>
          <stop offset="100%" stop-color="${endColor}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="720" rx="56" fill="url(#g)"/>
      <circle cx="1020" cy="140" r="180" fill="rgba(255,255,255,0.12)"/>
      <circle cx="170" cy="580" r="220" fill="rgba(255,255,255,0.10)"/>
      <text x="72" y="134" fill="white" font-size="44" font-family="Arial, sans-serif" font-weight="700">NUTECH Connect</text>
      <text x="72" y="220" fill="white" font-size="78" font-family="Arial, sans-serif" font-weight="800">${title}</text>
      <text x="72" y="290" fill="white" font-size="34" font-family="Arial, sans-serif" opacity="0.9">${subtitle}</text>
      <rect x="72" y="370" width="420" height="12" rx="6" fill="rgba(255,255,255,0.35)"/>
      <rect x="72" y="408" width="300" height="12" rx="6" fill="rgba(255,255,255,0.22)"/>
      <text x="72" y="620" fill="white" font-size="28" font-family="Arial, sans-serif" opacity="0.9">Official campus highlight</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const COMMUNITY_SECTIONS: HubSection[] = [
  { id: 'topics', label: '/topics & feed', description: 'All subject categories and official posts.' },
  { id: 'announcements', label: '/announcements', description: 'Official university updates.' },
  { id: 'resources', label: '/resources', description: 'Notes and slides with external links only.' },
  { id: 'events', label: '/events', description: 'RSVP to campus events.' },
  { id: 'internships', label: '/internships', description: 'Apply and track internship applications.' },
  { id: 'mentors', label: '/mentors', description: 'Request a mentor for guidance.' },
  { id: 'marketplace', label: '/marketplace', description: 'Student services and listings in PKR.' },
  { id: 'lost-found', label: '/lost-found', description: 'Report or find lost items.' },
  { id: 'projects', label: '/projects', description: 'Share your side projects.' },
  { id: 'picks', label: '/picks', description: 'Staff-curated tools and methods.' },
];

const HUB_RESOURCES = [
  { title: 'Programming Fundamentals Slides', meta: 'External link only', link: 'https://example.com/nutech-programming-fundamentals' },
  { title: 'Data Structures Notes Pack', meta: 'External link only', link: 'https://example.com/nutech-data-structures-notes' },
  { title: 'Software Engineering Lab Rubric', meta: 'External link only', link: 'https://example.com/nutech-se-rubric' },
];

const HUB_EVENTS: EventCard[] = [
  { id: 1, title: 'Career Fair Prep Session', date: 'Jul 15', time: '2:00 PM', location: 'Main Auditorium', seats: 80, attendees: 42, summary: 'Resume checks, interview tips, and recruiter guidance.', details: 'Bring a one-page resume and your internship goals. Staff and senior students will review your pitch.', image: makeEventPoster('Career Fair Prep', 'Resume checks and recruiter guidance', '#7C57D1', '#4F46E5') },
  { id: 2, title: 'Hackathon Kickoff', date: 'Jul 17', time: '11:00 AM', location: 'Innovation Lab', seats: 120, attendees: 96, summary: 'Team formation, themes, and kickoff briefing.', details: 'Meet your teammates, review problem statements, and register before slots close.', image: makeEventPoster('Hackathon Kickoff', 'Teams, themes, and prizes', '#0F766E', '#14B8A6') },
];

const HUB_INTERNSHIPS: InternshipCard[] = [
  { id: 1, company: 'DevForge', role: 'Frontend Intern', deadline: 'Jul 24, 2026', status: 'Applied' as const, likes: 18, summary: 'Modern React work on campus-facing tools.', type: 'Internship' as const },
  { id: 2, company: 'SecureStack', role: 'SOC Intern', deadline: 'Jul 28, 2026', status: 'Saved' as const, likes: 27, summary: 'Security monitoring and alert triage.', type: 'Internship' as const },
];

const HUB_MENTORS: MentorCard[] = [
  { id: 1, topic: 'Exam planning', preferredMentor: 'Senior CS student', status: 'Matched' as const, senior: 'Ali Raza', expertise: 'Semester planning and notes' },
  { id: 2, topic: 'Final year project', preferredMentor: 'Faculty advisor', status: 'Requested' as const, senior: 'Dr. Sana', expertise: 'Project scope and documentation' },
];

const HUB_MARKETPLACE = [
  { id: 1, title: 'Operating Systems textbook', seller: 'Zainab Shah', pricePKR: 800, description: 'Clean copy, semester 3 edition.' },
  { id: 2, title: 'Lab coat and toolkit', seller: 'Ali Raza', pricePKR: 1200, description: 'Good condition for engineering labs.' },
];

const HUB_LOST_FOUND = [
  { id: 1, title: 'Red lanyard room key', type: 'Found' as const, location: 'Cafeteria Ground Floor', description: 'Handed to Student Affairs Desk.' },
  { id: 2, title: 'Blue calculator', type: 'Lost' as const, location: 'Block B stairwell', description: 'Owner can verify by label.' },
];

const HUB_PROJECTS = [
  { id: 1, title: 'Attendance dashboard', owner: 'Muhammad Usman', link: 'https://github.com/example/attendance-dashboard', summary: 'A lightweight student attendance tracker.' },
  { id: 2, title: 'Campus helper bot', owner: 'Amna Batool', link: 'https://github.com/example/campus-helper-bot', summary: 'Discord bot for campus notices and study groups.' },
];

const HUB_PICKS = [
  { id: 1, title: 'Zotero', category: 'Research workflow', notes: 'Use it for citations and paper organization.' },
  { id: 2, title: 'Notion templates', category: 'Study method', notes: 'Weekly review and assignment tracker.' },
  { id: 3, title: 'Figma Dev Mode', category: 'Project work', notes: 'Helpful for UI handoff and component review.' },
];

const INITIAL_CLASS_CHATS: Record<string, ClassChatMessage[]> = {
  "Cyber Security": [
    { id: 1, sender: "Ali Raza", text: "Hey guys, has anyone completed the cryptography lab submission?", timestamp: Date.now() - 3600000 },
    { id: 2, sender: "Sarah Amin", text: "Yes! It was simple. Just use the AES-256 script sir shared.", timestamp: Date.now() - 1800000 },
    { id: 3, sender: "Hamza Khan", text: "Do we have to submit the report today or is it extended?", timestamp: Date.now() - 600000 }
  ],
  "Computer Science": [
    { id: 1, sender: "Bilal Shah", text: "Is anyone studying for the discrete structures quiz tomorrow?", timestamp: Date.now() - 4200000 },
    { id: 2, sender: "Dua Fatima", text: "Yes, doing the past papers from NUTECH vault. Super helpful!", timestamp: Date.now() - 2200000 },
    { id: 3, sender: "Asad Ahmed", text: "Could someone explain recursion tree method in complexity analysis?", timestamp: Date.now() - 800000 }
  ],
  "Software Engineering": [
    { id: 1, sender: "Waqas Ali", text: "Our software requirements engineering project pitch is scheduled on Wednesday.", timestamp: Date.now() - 5000000 },
    { id: 2, sender: "Minahil Jan", text: "Awesome! Our team is already prepared with the SRS document.", timestamp: Date.now() - 3000000 },
    { id: 3, sender: "Zubair Ahmed", text: "Does anyone have the standard template for the SRS document?", timestamp: Date.now() - 1200000 }
  ]
};

const OFFICIAL_NUTECH_DATABASE = `
[Official NUTECH Campus Database]
- Midterm Exams: Scheduled for Monday, July 14, 2026. Midterms remain strictly on this date. There is NO official delay, and rumors of delays are false.
- Final Exams: Scheduled from August 18, 2026 to August 28, 2026.
- Fee Submission Deadline: Closes on Wednesday, July 15, 2026 at 4:00 PM. No extension is planned, and students must submit fees on time to avoid fine.
- CS-202 Makeup Lab: Scheduled for Thursday, July 16, 2026 from 11:00 AM to 1:00 PM in Lab 3, NUSIT Building.
- Attendance Policy: Minimum 75% attendance is strictly required to sit in final exams. Students with less than 75% will be debarred automatically. No exceptions.
- Summer Course Registration Window: Closes on July 20, 2026.
- Scholarship Eligibility: CGPA >= 3.5 is strictly required for the NUTECH Merit Scholarship.
- Transport Services: Route 1 departs at 7:15 AM from G-11 Markaz to Campus daily.
- Lost and Found Desk: Located in Room 102, Ground Floor, Academic Block A.
`;

// --- GEMMA 4 OFFLINE ENGINE SIMULATOR ---
function getLocalGemmaResponse(prompt: string): string {
  const latestUserMessage = prompt.includes("USER:") 
    ? prompt.split("USER:").pop()?.split("\n")[0].trim() || "" 
    : prompt.trim();
  
  const input = latestUserMessage.toLowerCase();
  
  if (input.includes("midterm") || input.includes("mid term") || input.includes("date") && input.includes("mid") || input.includes("exam") && input.includes("mid")) {
    return `- **Midterm Exams**: Scheduled for **Monday, July 14, 2026**. There is NO official delay, and rumors of delays are false.`;
  }
  if (input.includes("final")) {
    return `- **Final Exams**: Scheduled from **August 18, 2026 to August 28, 2026**. Minimum 75% attendance is required to sit in final exams.`;
  }
  if (input.includes("fee") || input.includes("deadline") || input.includes("dues") || input.includes("submission") || input.includes("fine")) {
    return `- **Fee Submission Deadline**: Closes on **Wednesday, July 15, 2026 at 4:00 PM**. No extension is planned. Clear dues immediately to avoid late fines.`;
  }
  if (input.includes("attendance") || input.includes("policy") || input.includes("debar") || input.includes("75") || input.includes("percent")) {
    return `- **Attendance Policy**: Minimum **75% attendance** is strictly required to sit in final exams. Less than 75% results in automatic debarment. No exceptions.`;
  }
  if (input.includes("makeup") || input.includes("lab") || input.includes("cs-202") || input.includes("cs 202")) {
    return `- **CS-202 Makeup Lab**: Scheduled for **Thursday, July 16, 2026 from 11:00 AM to 1:00 PM** in **Lab 3, NUSIT Building**.`;
  }
  if (input.includes("scholarship") || input.includes("cgpa") || input.includes("gpa")) {
    return `- **Scholarship Eligibility**: CGPA **>= 3.5** is strictly required for the **NUTECH Merit Scholarship**.`;
  }
  if (input.includes("summer") || input.includes("registration")) {
    return `- **Summer Course Registration**: The registration window closes on **July 20, 2026**.`;
  }
  if (input.includes("transport") || input.includes("bus") || input.includes("route") || input.includes("g-11") || input.includes("schedule")) {
    return `- **Transport Services**: Route 1 departs at **7:15 AM** from **G-11 Markaz** to Campus daily.`;
  }
  if (input.includes("lost") || input.includes("found") || input.includes("key")) {
    return `- **Lost and Found Desk**: Located in **Room 102, Ground Floor, Academic Block A**.`;
  }
  if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    return `Hello! I am your Gemma 4 Offline AI Mentor. Ask me any questions about NUTECH schedules, deadlines, transport, or policies!`;
  }
  
  return `Based on NUTECH's official campus handbook, I can assist you with details regarding:
  • **Midterm & Final Exams** (Dates & Delay clarifications)
  • **Attendance Requirements** (75% minimum threshold)
  • **Fee submission deadlines** (July 15th, 4:00 PM)
  • **CS-202 Makeup Labs** (Thursday 11 AM, Lab 3)
  • **Transport Routes** (Route 1 G-11 Markaz)
  • **Merit Scholarships** (requires >= 3.5 CGPA)
  • **Lost & Found desk** (Room 102, Academic Block A)`;
}

function getLocalFactCheck(content: string) {
  const input = content.toLowerCase();
  if (input.includes("delay") || input.includes("postpone") || input.includes("reschedule")) {
    return {
      isVerified: false,
      verificationStatus: "UNVERIFIED_RUMOR",
      verificationText: "Unverified Rumor. According to the official NUTECH Academic Calendar, midterms remain scheduled for Monday, July 14th. No official delay has been approved.",
      verificationSource: "NUTECH Academic Registrar"
    };
  }
  if (input.includes("fee") || input.includes("deadline") || input.includes("dues")) {
    return {
      isVerified: true,
      verificationStatus: "VERIFIED",
      verificationText: "Verified. Fee submission deadline for the Spring Semester closes tomorrow at 4:00 PM. Please clear your dues on time.",
      verificationSource: "NUTECH Accounts Office"
    };
  }
  if (input.includes("lost") || input.includes("found") || input.includes("key")) {
    return {
      isVerified: true,
      verificationStatus: "VERIFIED",
      verificationText: "Verified. Academic Block A has a dedicated Lost and Found desk in Room 102.",
      verificationSource: "Student Affairs Office"
    };
  }
  return {
    isVerified: true,
    verificationStatus: "NEUTRAL",
    verificationText: "Verified student announcement. No conflicting official policy found.",
    verificationSource: "NUTECH Connect Bulletin"
  };
}

function getLocalDailyDigest(posts: Post[]): string {
  const header = "🤖 [Gemma 4 Offline Core Engine]\n\n";
  if (posts.length === 0) {
    return `${header}No posts have been published today. Add posts with #Admin, #Exams, or #Deadlines, or ask questions to populate the digest!`;
  }

  const deadlines = posts.filter(it => it.content.toLowerCase().includes("#deadlines") || it.content.toLowerCase().includes("fee"));
  const exams = posts.filter(it => it.content.toLowerCase().includes("#exams") || it.content.toLowerCase().includes("midterm"));
  const others = posts.filter(it => !deadlines.includes(it) && !exams.includes(it));

  let sb = header;
  sb += "⚠️ DEADLINES:\n";
  if (deadlines.length > 0) {
    deadlines.forEach(it => {
      sb += `- ${it.content.replace(/#Deadlines/i, "").replace(/#Admin/i, "").trim()} (${it.authorName})\n`;
    });
  } else {
    sb += "- Fee Submission deadline closes Wednesday, July 15, 2026 at 4:00 PM. Please clear dues immediately to avoid late fines.\n";
  }

  sb += "\n📢 CAMPUS ALERT & EXAMS:\n";
  if (exams.length > 0) {
    exams.forEach(it => {
      sb += `- ${it.content.replace(/#Exams/i, "").trim()} (${it.authorName})\n`;
    });
  } else {
    sb += "- Midterm Exams are strictly on Monday, July 14, 2026. Rumors of delays are officially false.\n";
  }

  sb += "\n📚 STUDY GROUPS & GENERAL:\n";
  const mainOthers = others.filter(it => !it.content.toLowerCase().includes("key"));
  if (mainOthers.length > 0) {
    mainOthers.slice(0, 3).forEach(it => {
      sb += `- ${it.authorName}: "${it.content.trim()}"\n`;
    });
  } else {
    sb += "- Amna Batool: \"Starting a study group for programming fundamentals final prep. Friday at 2 PM.\"\n";
  }

  return sb;
}

function getLocalEventParsing(text: string) {
  const input = text.toLowerCase();
  if (input.includes("cs-202") || input.includes("makeup") || input.includes("lab")) {
    return {
      title: "CS-202 Makeup Lab",
      date: "Thursday, July 16, 2026",
      time: "11:00 AM - 1:00 PM",
      location: "Lab 3, NUSIT Building"
    };
  }
  if (input.includes("midterm") || input.includes("exam")) {
    return {
      title: "Midterm Examination",
      date: "Monday, July 14, 2026",
      time: "09:00 AM - 12:00 PM",
      location: "Main Academic Hall"
    };
  }
  return {
    title: "NUTECH Event",
    date: "July 16, 2026",
    time: "10:00 AM",
    location: "Campus Auditorium"
  };
}

function renderFormattedText(text: string, textClassName = "") {
  return text.split('\n').map((line, lineIndex) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={lineIndex} className="h-2" />;
    }

    const isBullet = /^[-•]/.test(trimmedLine);
    const bulletText = trimmedLine.replace(/^[-•]\s*/, '');
    const parts = bulletText.split(/(\*\*.*?\*\*)/g).filter(Boolean);

    return (
      <div key={lineIndex} className={`flex gap-2 ${isBullet ? 'pl-1' : ''}`}>
        {isBullet && <span className="shrink-0 opacity-80">•</span>}
        <span className={`min-w-0 ${textClassName}`}>
          {parts.map((part, partIndex) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={partIndex} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={partIndex}>{part}</span>
            )
          )}
        </span>
      </div>
    );
  });
}



function normalizeStudentId(value: string) {
  const cleaned = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = cleaned.match(/^F?(\d{5,})$/);
  if (!match) return '';
  return `f${match[1]}`;
}

function parseScannedIdPayload(rawText: string): ParsedCardProfile | null {
  const trimmed = rawText.replace(/\r/g, '\n').trim();
  if (!trimmed) return null;

  const lines = trimmed
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const joined = lines.join('\n');

  if (!/nutech/i.test(joined)) {
    return null;
  }

  const readField = (label: string, stopLabels: RegExp[] = []) => {
    const labelRegex = new RegExp(`^\\s*${label}\\b\\s*[:=\\-]?\\s*(.*)$`, 'i');

    for (let index = 0; index < lines.length; index++) {
      if (!new RegExp(`^\\s*${label}\\b`, 'i').test(lines[index])) continue;

      const sameLineMatch = lines[index].match(labelRegex);
      if (sameLineMatch?.[1]?.trim()) {
        return sameLineMatch[1].trim();
      }

      for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex++) {
        const candidate = lines[nextIndex].trim();
        if (!candidate) continue;
        if (stopLabels.some((stopLabel) => stopLabel.test(candidate))) break;
        return candidate;
      }
    }
    return '';
  };

  const directId = normalizeStudentId(
    readField('id', [/^name$/i, /^father name$/i, /^cnic$/i, /^blood group$/i, /^department$/i, /^date of issue$/i, /^validity$/i]) ||
    (joined.match(/\bF(\d{5,})\b/i)?.[0] ?? '')
  );

  const directName = readField('name', [/^father name$/i, /^cnic$/i, /^blood group$/i, /^department$/i, /^date of issue$/i, /^validity$/i, /^id$/i]);
  const department = readField('department', [/^date of issue$/i, /^validity$/i, /^id$/i]);

  if (!directName || !directId) {
    return null;
  }

  return {
    format: 'nutech-registration-card',
    profile: {
      email: `${directId}@nutech.edu.pk`,
      name: directName,
      isUniversityStudent: true,
      batch: '',
      department: department || 'NUTECH Student',
      rollNumber: directId,
      authType: 'ID_QR'
    }
  };
}

// --- MAIN COMPONENT APP ---
const App = () => {
  // Mode States
  const [isDarkTheme, setIsDarkTheme] = useState(() => localStorage.getItem('isDarkTheme') !== 'false');
  const [isOfflineMode, setIsOfflineMode] = useState(() => localStorage.getItem('isOfflineMode') !== 'false');
  const [selectedTab, setSelectedTab] = useState(0); // 0: Social Feed, 1: Events, 2: Internships, 3: Mentors, 4: GPA, 5: AI, 6: Daily Digest
  
  // User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Local Storage DB States
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('posts');
    return saved ? JSON.parse(saved) : DEMO_POSTS;
  });
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : DEMO_EVENTS;
  });
  const [courses, setCourses] = useState<CalculatorCourse[]>(() => {
    const saved = localStorage.getItem('courses');
    return saved ? JSON.parse(saved) : [];
  });
  const [classChatMessages, setClassChatMessages] = useState<Record<string, ClassChatMessage[]>>(() => {
    const saved = localStorage.getItem('classChatMessages');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_CHATS;
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [
      { id: 1, sender: "AI", text: "Hello! I am your NUTECH Connect AI Mentor. You can ask me about campus rules, schedules, transport routes, and academic policies.", timestamp: Date.now() }
    ];
  });

  // UI Control States
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [activeChatDept, setActiveChatDept] = useState("Cyber Security");
  const [selectedHubSection, setSelectedHubSection] = useState<HubSectionId>('topics');
  const [notificationBanner, setNotificationBanner] = useState<NotificationBannerState | null>(null);
  const [notificationProgress, setNotificationProgress] = useState(1);
  
  // Input fields state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState("");

  const [feedInput, setFeedInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [classChatInput, setClassChatInput] = useState("");
  const [anonymousReportInput, setAnonymousReportInput] = useState("");
  const [announcementInput, setAnnouncementInput] = useState("");
  const [resourceInput, setResourceInput] = useState("");
  const [resourceLinkInput, setResourceLinkInput] = useState("");
  const [resources, setResources] = useState(HUB_RESOURCES);
  const [eventCards, setEventCards] = useState(HUB_EVENTS);
  const [eventRsvps, setEventRsvps] = useState<EventRsvp[]>([]);
  const [internshipCards, setInternshipCards] = useState(HUB_INTERNSHIPS);
  const [internshipCompany, setInternshipCompany] = useState("");
  const [internshipRole, setInternshipRole] = useState("");
  const [internshipDeadline, setInternshipDeadline] = useState("");
  const [mentorCards] = useState(HUB_MENTORS);
  const [mentorTopic, setMentorTopic] = useState("");
  const [mentorPreferred, setMentorPreferred] = useState("");
  const [marketplaceTitle, setMarketplaceTitle] = useState("");
  const [marketplacePrice, setMarketplacePrice] = useState("");
  const [lostFoundTitle, setLostFoundTitle] = useState("");
  const [lostFoundLocation, setLostFoundLocation] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [pickTitle, setPickTitle] = useState("");
  const [pickNotes, setPickNotes] = useState("");
  const [anonymousReports, setAnonymousReports] = useState<Array<{ id: number; text: string; category: string }>>([]);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState(DEMO_POSTS.filter((post) => post.authorRole.includes('Registrar')).map((post) => ({
    id: post.id,
    title: post.authorName,
    body: post.content,
    source: post.authorRole,
  })));
  const [internships, setInternships] = useState<InternshipApplication[]>(HUB_INTERNSHIPS);
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>(HUB_MENTORS);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(HUB_MARKETPLACE);
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(HUB_LOST_FOUND);
  const [projectShares, setProjectShares] = useState<ProjectShare[]>(HUB_PROJECTS);
  const [picks, setPicks] = useState<PickItem[]>(HUB_PICKS);

  // Daily Digest States
  const [dailyDigest, setDailyDigest] = useState<string | null>(null);
  const [isSynthesizingDigest, setIsSynthesizingDigest] = useState(false);

  // Screenshot/Event Extractor States
  const [extractorText, setExtractorText] = useState("");
  const [extractedResult, setExtractedResult] = useState<Omit<CalendarEvent, 'id'> | null>(null);

  // GPA Form state
  const [gpaSemester, setGpaSemester] = useState(1);
  const [gpaCourseName, setGpaCourseName] = useState("");
  const [gpaCreditHours, setGpaCreditHours] = useState(3);
  const [gpaGrade, setGpaGrade] = useState("A");

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const classChatBottomRef = useRef<HTMLDivElement>(null);
  const scannerVideoRef = useRef<HTMLVideoElement>(null);
  const scannerFileInputRef = useRef<HTMLInputElement>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const [isIdScannerOpen, setIsIdScannerOpen] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'requesting' | 'ready' | 'processing' | 'error'>('idle');
  const [scannerMessage, setScannerMessage] = useState('Use your phone camera to scan an ID card.');

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('isDarkTheme', String(isDarkTheme));
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    localStorage.setItem('isOfflineMode', String(isOfflineMode));
  }, [isOfflineMode]);

  useEffect(() => {
    localStorage.setItem('currentUser', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('classChatMessages', JSON.stringify(classChatMessages));
  }, [classChatMessages]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Auto-scroll on chats
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  useEffect(() => {
    classChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [classChatMessages, activeChatDept]);

  useEffect(() => {
    if (!isIdScannerOpen) {
      setScannerStatus('idle');
      setScannerMessage('Use your phone camera to scan an ID card.');
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((track) => track.stop());
        scannerStreamRef.current = null;
      }
      if (scannerVideoRef.current) {
        scannerVideoRef.current.srcObject = null;
      }
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      setScannerStatus('requesting');
      setScannerMessage('Requesting camera permission...');

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerStatus('error');
        setScannerMessage('This browser does not support camera access.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        scannerStreamRef.current = stream;

        if (scannerVideoRef.current) {
          scannerVideoRef.current.srcObject = stream;
          await scannerVideoRef.current.play().catch(() => undefined);
        }

        setScannerStatus('ready');
        setScannerMessage('Camera ready. Frame the NUTECH card and tap Scan Card Now, or upload an image.');
      } catch (error) {
        setScannerStatus('error');
        setScannerMessage(error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access to scan your ID card.'
          : 'Unable to open the camera. Please check device permissions and try again.');
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((track) => track.stop());
        scannerStreamRef.current = null;
      }
      if (scannerVideoRef.current) {
        scannerVideoRef.current.srcObject = null;
      }
    };
  }, [isIdScannerOpen]);

  // Handle banner timeouts
  useEffect(() => {
    if (notificationBanner) {
      const duration = notificationBanner.duration ?? 8000;
      const expiresAt = Date.now() + duration;
      setNotificationProgress(1);

      const timer = setTimeout(() => {
        setNotificationBanner(null);
      }, duration);

      const interval = setInterval(() => {
        const remaining = Math.max(0, expiresAt - Date.now());
        setNotificationProgress(remaining / duration);
      }, 50);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
    setNotificationProgress(1);
  }, [notificationBanner]);

  // GPA calculations
  const calculateGPA = () => {
    if (courses.length === 0) return { cgpa: 0, totalCredits: 0 };
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach(c => {
      totalPoints += (c.gradePoints * c.creditHours);
      totalCredits += c.creditHours;
    });
    return {
      cgpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
      totalCredits
    };
  };

  const { cgpa, totalCredits } = calculateGPA();

  // Trigger confetti for high GPA
  useEffect(() => {
    if (cgpa >= 3.5 && courses.length > 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#A084E8', '#8BE8CB', '#FFD1E3']
      });
    }
  }, [cgpa, courses.length]);

  // --- ACTIONS ---
  const parseNutechEmail = (email: string): UserProfile | null => {
    const cleanEmail = email.trim().toLowerCase();
    const pattern = /^f(\d{2})(\d{4})(\d+)@nutech\.edu\.pk$/;
    const match = cleanEmail.match(pattern);
    if (match) {
      const [_, batchDigits, deptDigits, rollDigits] = match;
      let dept = "Information Technology";
      if (deptDigits === "6090") dept = "Cyber Security";
      else if (deptDigits === "5020") dept = "Computer Science";
      else if (deptDigits === "4030") dept = "Software Engineering";

      return {
        email,
        name: `Student f${batchDigits}${deptDigits}${rollDigits}`,
        isUniversityStudent: true,
        batch: `Batch ${batchDigits}`,
        department: dept,
        rollNumber: rollDigits,
        authType: 'Email'
      };
    }
    return null;
  };

  const handleOpenIdScanner = () => {
    setScannerStatus('idle');
    setScannerMessage('Use your phone camera to scan an ID card.');
    setIsIdScannerOpen(true);
  };

  const applyScannedProfile = (parsed: ParsedCardProfile) => {
    setCurrentUser(parsed.profile);
    setLoginEmail(parsed.profile.email);
    setLoginName(parsed.profile.name);
    setOtpStep(false);
    setOtpCode('');
    setNotificationBanner({
      title: `🪪 Card Scanned (${parsed.format.toUpperCase()})`,
      message: `Logged in as ${parsed.profile.name} from a ${parsed.format} ID scan.`,
      duration: 6000
    });
    setIsIdScannerOpen(false);
  };

  const recognizeImage = async (source: HTMLCanvasElement | File) => {
    setScannerStatus('processing');
    setScannerMessage('Reading the NUTECH ID card...');

    try {
      const result = await Tesseract.recognize(source, 'eng');
      const parsed = parseScannedIdPayload(result.data.text ?? '');

      if (parsed) {
        applyScannedProfile(parsed);
        return;
      }

      setScannerStatus('error');
      setScannerMessage('Only NUTECH registration cards with readable NAME and ID are supported.');
    } catch {
      setScannerStatus('error');
      setScannerMessage('Unable to read the card image. Please try again with a clearer photo or upload.');
    }
  };

  const captureAndScanCamera = async () => {
    if (!scannerVideoRef.current) return;

    const video = scannerVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (!canvas.width || !canvas.height) {
      setScannerStatus('error');
      setScannerMessage('Camera is not ready yet. Please wait a moment and try again.');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      setScannerStatus('error');
      setScannerMessage('Unable to access the camera frame.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    await recognizeImage(canvas);
  };

  const handleScannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await recognizeImage(file);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = parseNutechEmail(loginEmail);
    if (profile) {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(randomCode);
      setOtpStep(true);
      setNotificationBanner({
        title: "🔑 NUTECH Auth Mail System",
        message: `New mail to ${loginEmail}: Your login verification OTP code is ${randomCode}.`
      });
    } else {
      setNotificationBanner({
        title: "❌ Invalid Email Format",
        message: "Please use official NUTECH student format, e.g. f25609038@nutech.edu.pk"
      });
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() === simulatedOtp) {
      const profile = parseNutechEmail(loginEmail);
      if (profile) {
        const finalName = loginEmail.toLowerCase().trim() === "f25609038@nutech.edu.pk" 
          ? "Ali Shahnawaz Awan" 
          : loginName || profile.name;
        
        setCurrentUser({
          ...profile,
          name: finalName,
          authType: 'Email_OTP'
        });
        setOtpStep(false);
        setOtpCode("");
        setNotificationBanner({
          title: "🎉 Login Successful",
          message: `Welcome to NUTECH Connect, ${finalName}!`
        });
      }
    } else {
      setNotificationBanner({
        title: "❌ Verification Failed",
        message: "The entered verification OTP code is incorrect."
      });
    }
  };

  const handleGoogleLogin = () => {
    const profile: UserProfile = {
      email: "moviesmax2007@gmail.com",
      name: "Movies Max",
      isUniversityStudent: false,
      batch: "",
      department: "",
      rollNumber: "",
      authType: "Google"
    };
    setCurrentUser(profile);
    setNotificationBanner({
      title: "👤 Authenticated via Google",
      message: "Logged in as Guest Explorer. University-student features will be locked."
    });
  };

  const handleAnonymousBrowse = () => {
    const profile: UserProfile = {
      email: "public.guest@nutechconnect.com",
      name: "Guest Explorer",
      isUniversityStudent: false,
      batch: "",
      department: "",
      rollNumber: "",
      authType: "Email"
    };
    setCurrentUser(profile);
    setNotificationBanner({
      title: "👤 Welcome Guest",
      message: "Browsing NUTECH Connect as public Guest view."
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedTab(0);
    setDailyDigest(null);
    setNotificationBanner({
      title: "🚪 Logged Out",
      message: "Your session has ended."
    });
  };

  // Publish post to social feed
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedInput.trim() || !currentUser) return;

    const newPost: Post = {
      id: Date.now(),
      authorName: currentUser.name,
      authorRole: currentUser.isUniversityStudent ? `${currentUser.department} Student` : "Guest Viewer",
      content: feedInput.trim(),
      timestamp: Date.now(),
      likes: 0,
      commentsCount: 0
    };

    setPosts([newPost, ...posts]);
    setFeedInput("");

    // Simulate in-app notification & auto fact-check if contains rumors
    const fc = getLocalFactCheck(newPost.content);
    if (fc.verificationStatus === "UNVERIFIED_RUMOR") {
      setNotificationBanner({
        title: "⚠️ Rumor Filtered Flag",
        message: `Fact-Check: NUTECH Registrar states midterms are NOT delayed. Flagged post instantly.`
      });
    }
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementInput.trim() || !currentUser) return;

    setAnnouncements([
      {
        id: Date.now(),
        title: currentUser.name,
        body: announcementInput.trim(),
        source: currentUser.isUniversityStudent ? currentUser.department : 'Official Update',
      },
      ...announcements,
    ]);
    setAnnouncementInput('');
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceInput.trim() || !resourceLinkInput.trim()) return;

    setResources([
      {
        title: resourceInput.trim(),
        meta: 'External link only',
        link: resourceLinkInput.trim(),
      },
      ...resources,
    ]);

    setNotificationBanner({
      title: '📎 Resource Added',
      message: `${resourceInput.trim()} was added with an external link.`,
    });
    setResourceInput('');
    setResourceLinkInput('');
  };

  const handleRsvpEvent = (eventId: number, status: EventRsvp['status']) => {
    setEventRsvps((prev) => {
      const next = prev.filter((entry) => entry.eventId !== eventId);
      return [...next, { eventId, status }];
    });
  };

  const handleAddInternship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internshipCompany.trim() || !internshipRole.trim()) return;

    setInternships([
      {
        id: Date.now(),
        company: internshipCompany.trim(),
        role: internshipRole.trim(),
        deadline: internshipDeadline.trim() || 'TBD',
        status: 'Saved',
      },
      ...internships,
    ]);
    setInternshipCompany('');
    setInternshipRole('');
    setInternshipDeadline('');
  };

  const handleAddMentorRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorTopic.trim()) return;

    setMentorRequests([
      {
        id: Date.now(),
        topic: mentorTopic.trim(),
        preferredMentor: mentorPreferred.trim() || 'Any available mentor',
        status: 'Requested',
      },
      ...mentorRequests,
    ]);
    setMentorTopic('');
    setMentorPreferred('');
  };

  const handleAddMarketplaceListing = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(marketplacePrice);
    if (!marketplaceTitle.trim() || Number.isNaN(price) || price <= 0) return;

    setMarketplaceListings([
      {
        id: Date.now(),
        title: marketplaceTitle.trim(),
        seller: currentUser?.name || 'Student Seller',
        pricePKR: price,
        description: 'Student service listing.',
      },
      ...marketplaceListings,
    ]);
    setMarketplaceTitle('');
    setMarketplacePrice('');
  };

  const handleAddLostFoundItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostFoundTitle.trim()) return;

    setLostFoundItems([
      {
        id: Date.now(),
        title: lostFoundTitle.trim(),
        type: 'Found',
        location: lostFoundLocation.trim() || 'Campus',
        description: 'Submitted through the NUTECH Connect lost-and-found board.',
      },
      ...lostFoundItems,
    ]);
    setLostFoundTitle('');
    setLostFoundLocation('');
  };

  const handleAddProjectShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectLink.trim()) return;

    setProjectShares([
      {
        id: Date.now(),
        title: projectTitle.trim(),
        owner: currentUser?.name || 'Project Creator',
        link: projectLink.trim(),
        summary: 'Shared from the NUTECH Connect projects board.',
      },
      ...projectShares,
    ]);
    setProjectTitle('');
    setProjectLink('');
  };

  const handleAddPick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickTitle.trim()) return;

    setPicks([
      {
        id: Date.now(),
        title: pickTitle.trim(),
        category: 'Community pick',
        notes: pickNotes.trim() || 'Recommended by the community.',
      },
      ...picks,
    ]);
    setPickTitle('');
    setPickNotes('');
  };

  const handleDeletePost = (id: number) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleLikePost = (id: number) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  // GPA Add Course
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpaCourseName.trim()) return;

    const gradePointsMap: Record<string, number> = {
      "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0
    };

    const newCourse: CalculatorCourse = {
      id: Date.now(),
      semester: gpaSemester,
      courseName: gpaCourseName.trim(),
      creditHours: gpaCreditHours,
      grade: gpaGrade,
      gradePoints: gradePointsMap[gpaGrade] || 0
    };

    setCourses([...courses, newCourse]);
    setGpaCourseName("");
  };

  const handleAddPredefinedCourse = (name: string, credits: number) => {
    setGpaCourseName(name);
    setGpaCreditHours(credits);
  };

  const handleRemoveCourse = (id: number) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleClearCalculator = () => {
    setCourses([]);
  };

  // AI Counselor Button Action
  const handleAskAiAboutGpa = () => {
    if (courses.length === 0) {
      const userText = "I haven't added any courses to my GPA Calculator yet. What is NUTECH's official GPA policy, and how is CGPA calculated?";
      sendChatMessage(userText);
      setSelectedTab(5);
      return;
    }

    let p = `I have tracked my academic progress using the NUTECH GPA Calculator. Here are my current stats:\n`;
    p += `- Current CGPA: ${cgpa.toFixed(2)}\n`;
    p += `- Courses Tracked:\n`;
    courses.forEach(c => {
      p += `  • Semester ${c.semester}: ${c.courseName} (Grade: ${c.grade}, Credits: ${c.creditHours})\n`;
    });

    p += `\nBased on NUTECH academic policies:\n`;
    if (cgpa >= 3.5) {
      p += `I want to know if I am eligible for the NUTECH Merit Scholarship (which requires CGPA >= 3.5). What are the exact rules to apply and maintain it? Can you also suggest study techniques to keep my grades up?`;
    } else if (cgpa >= 3.0) {
      p += `I am currently in good standing but want to reach the 3.5 CGPA threshold to qualify for the NUTECH Merit Scholarship. What specific grades do I need in my upcoming semester courses, and how can I optimize my study plan?`;
    } else if (cgpa >= 2.0) {
      p += `My CGPA is between 2.0 and 3.0. I want to raise my grades. What is NUTECH's policy on repeating courses to improve my CGPA, and how can I get academic mentoring?`;
    } else {
      p += `My CGPA is below 2.0, which puts me at risk of academic warning or probation. What are the official NUTECH probation rules, how can I repeat courses, and what support services are available to help me recover?`;
    }

    sendChatMessage(p);
    setSelectedTab(5);
  };

  // Send AI chat message
  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'USER',
      text: text.trim(),
      timestamp: Date.now()
    };

    const nextHistory = [...chatHistory, userMsg];
    setChatHistory(nextHistory);
    setChatInput("");
    setChatLoading(true);

    // Context aggregation
    const historyContext = nextHistory.slice(-6).map(m => `${m.sender}: ${m.text}`).join("\n");
    const systemPrompt = `
      You are NUTECH Connect AI Mentor. You have access to NUTECH's official data, schedules, and policies.
      Answer the student's question concisely, helpfully, and with professional empathy. Use the provided official database to give factual answers:
      
      ${OFFICIAL_NUTECH_DATABASE}
      
      Guidelines:
      - ALWAYS base your answers on the database. If a student asks about midterms, attendance, or fees, verify with the database and state the rules.
      - Keep answers clear and friendly. Use short bullet points where appropriate.
      - If the question is unrelated to university or cannot be verified from the database, polite answer but guide them back to NUTECH Connect's campus scope.
    `;

    setTimeout(async () => {
      let aiText = "";
      if (isOfflineMode) {
        aiText = getLocalGemmaResponse(historyContext);
      } else {
        // Online Gemini API call simulator / REST hook
        const apiKey = getGeminiApiKey();
        if (!apiKey) {
          aiText = getLocalGemmaResponse(historyContext);
        } else {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: historyContext }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
              })
            });
            const data = await response.json();
            aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response parsed.";
          } catch (e) {
            aiText = getLocalGemmaResponse(historyContext);
          }
        }
      }

      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'AI',
        text: aiText,
        timestamp: Date.now()
      }]);
      setChatLoading(false);
    }, 1200);
  };

  const handleSendChatMessageForm = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(chatInput);
  };

  const handleClearChat = () => {
    setChatHistory([
      { id: Date.now(), sender: "AI", text: "Chat history cleared. How can I assist you with NUTECH policies or schedules today?", timestamp: Date.now() }
    ]);
  };

  // Class chat publish
  const handlePublishClassChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classChatInput.trim() || !currentUser) return;

    const newMsg: ClassChatMessage = {
      id: Date.now(),
      sender: currentUser.name,
      text: classChatInput.trim(),
      timestamp: Date.now()
    };

    setClassChatMessages({
      ...classChatMessages,
      [activeChatDept]: [...(classChatMessages[activeChatDept] || []), newMsg]
    });
    setClassChatInput("");
  };

  // Daily Digest Generator
  const handleLoadDailyDigest = () => {
    setIsSynthesizingDigest(true);
    setDailyDigest(null);

    setTimeout(() => {
      const digest = getLocalDailyDigest(posts);
      setDailyDigest(digest);
      setIsSynthesizingDigest(false);
    }, 1500);
  };



  const handleSubmitAnonymousReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousReportInput.trim()) return;

    setAnonymousReports([
      { id: Date.now(), text: anonymousReportInput.trim(), category: 'Anonymous campus report' },
      ...anonymousReports,
    ]);
    setAnonymousReportInput('');
    setNotificationBanner({
      title: '📝 Anonymous Report Sent',
      message: 'Your anonymous campus report has been saved locally.',
    });
  };

  const handleToggleEventAttendance = (eventId: number, action: 'attend' | 'skip') => {
    setEventCards((prev) => prev.map((event) => {
      if (event.id !== eventId) return event;
      const wasAttend = event.attendance === 'attend';
      let attendees = event.attendees;
      if (action === 'attend' && !wasAttend) attendees += 1;
      if (action === 'skip' && wasAttend) attendees = Math.max(0, attendees - 1);
      return { ...event, attendance: action, attendees };
    }));
  };

  const handleToggleInternshipLike = (internshipId: number) => {
    setInternshipCards((prev) => prev.map((item) => item.id === internshipId ? { ...item, likes: item.likes + 1 } : item));
  };

  const handleApplyInternship = (internshipId: number) => {
    setInternshipCards((prev) => prev.map((item) => item.id === internshipId ? { ...item, status: 'Applied' as const } : item));
    setNotificationBanner({ title: '📄 Internship Application', message: 'Marked as applied locally. You can track it in this tab.' });
  };

  const handleOpenMentorDm = (mentorName: string) => {
    setNotificationBanner({
      title: '💬 Move to DMs',
      message: `Opening a private help thread with ${mentorName}. Use this for specific guidance and follow-up questions.`,
    });
  };

  const renderHubSectionContent = () => {
    switch (selectedHubSection) {
      case 'announcements':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black tracking-tight">Official University Updates</h4>
                <p className="text-xs text-gray-500 dark:text-glass-textSub">Announcements posted by staff and registrar updates.</p>
              </div>
            </div>
            <form onSubmit={handlePublishAnnouncement} className="space-y-3">
              <textarea
                value={announcementInput}
                onChange={(e) => setAnnouncementInput(e.target.value)}
                placeholder="Write an official update or notice..."
                className="w-full h-24 text-xs p-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 focus:outline-none focus:border-[#A084E8] resize-none"
              />
              <div className="flex justify-end">
                <button className="h-9 px-4 bg-[#A084E8] hover:bg-[#8f70df] text-white font-bold text-xs uppercase tracking-wider rounded-xl">Post Announcement</button>
              </div>
            </form>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold">{announcement.title}</h5>
                      <p className="text-[10px] uppercase tracking-wider text-[#A084E8] mt-0.5">{announcement.source}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{announcement.body}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'resources':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-black tracking-tight">External Study Resources</h4>
              <p className="text-xs text-gray-500 dark:text-glass-textSub">Notes and slides are shared as external links only.</p>
            </div>
            <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={resourceInput} onChange={(e) => setResourceInput(e.target.value)} placeholder="Resource title" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <input value={resourceLinkInput} onChange={(e) => setResourceLinkInput(e.target.value)} placeholder="External link" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <div className="md:col-span-2 flex justify-end"><button className="h-9 px-4 bg-[#A084E8] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Add Link</button></div>
            </form>
            <div className="space-y-2">
              {resources.map((resource) => (
                <a key={resource.title} href={resource.link} target="_blank" rel="noreferrer" className="block rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40 hover:border-[#A084E8]/30 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold">{resource.title}</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">{resource.meta}</p>
                    </div>
                    <ExternalLink size={12} className="text-[#A084E8]" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      case 'events':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-black tracking-tight">Campus Events RSVP</h4>
              <p className="text-xs text-gray-500 dark:text-glass-textSub">Tap an RSVP status and keep your event interests tracked.</p>
            </div>
            <div className="space-y-3">
              {HUB_EVENTS.map((event) => {
                const current = eventRsvps.find((entry) => entry.eventId === event.id)?.status ?? 'Interested';
                return (
                  <div key={event.id} className="rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-bold">{event.title}</h5>
                        <p className="text-[10px] text-gray-500 mt-0.5">{event.time} • {event.location}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-[#A084E8] font-bold">{event.seats} seats</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['Going', 'Maybe', 'Interested'] as const).map((status) => (
                        <button key={status} onClick={() => handleRsvpEvent(event.id, status)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${current === status ? 'bg-[#A084E8] text-white border-[#A084E8]' : 'border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-glass-textSub'}`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'internships':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-black tracking-tight">Internship Applications</h4>
              <p className="text-xs text-gray-500 dark:text-glass-textSub">Save, apply, and track opportunities locally.</p>
            </div>
            <form onSubmit={handleAddInternship} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={internshipCompany} onChange={(e) => setInternshipCompany(e.target.value)} placeholder="Company" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <input value={internshipRole} onChange={(e) => setInternshipRole(e.target.value)} placeholder="Role" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <input value={internshipDeadline} onChange={(e) => setInternshipDeadline(e.target.value)} placeholder="Deadline" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <div className="md:col-span-3 flex justify-end"><button className="h-9 px-4 bg-[#A084E8] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Track Internship</button></div>
            </form>
            <div className="space-y-2">
              {internships.map((item) => (
                <div key={item.id} className="rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold">{item.company}</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.role} • Deadline {item.deadline}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#8BE8CB] uppercase tracking-wider">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'mentors':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-black tracking-tight">Mentor Requests</h4>
              <p className="text-xs text-gray-500 dark:text-glass-textSub">Request guidance from a mentor or senior student.</p>
            </div>
            <form onSubmit={handleAddMentorRequest} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={mentorTopic} onChange={(e) => setMentorTopic(e.target.value)} placeholder="Topic you need help with" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <input value={mentorPreferred} onChange={(e) => setMentorPreferred(e.target.value)} placeholder="Preferred mentor" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <div className="md:col-span-2 flex justify-end"><button className="h-9 px-4 bg-[#A084E8] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Request Mentor</button></div>
            </form>
            <div className="space-y-2">
              {mentorRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold">{request.topic}</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">{request.preferredMentor}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#A084E8] uppercase tracking-wider">{request.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'marketplace':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-black tracking-tight">Marketplace</h4>
              <p className="text-xs text-gray-500 dark:text-glass-textSub">Find student services and services in PKR.</p>
            </div>
            <form onSubmit={handleAddMarketplaceListing} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={marketplaceTitle} onChange={(e) => setMarketplaceTitle(e.target.value)} placeholder="Listing title" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <input value={marketplacePrice} onChange={(e) => setMarketplacePrice(e.target.value)} placeholder="PKR price" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <div className="flex items-end"><button className="h-10 w-full bg-[#A084E8] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Add Listing</button></div>
            </form>
            <div className="space-y-2">
              {marketplaceListings.map((item) => (
                <div key={item.id} className="rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold">{item.title}</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.seller}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#8BE8CB] uppercase tracking-wider">PKR {item.pricePKR}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'lost-found':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-black tracking-tight">Lost & Found</h4>
              <p className="text-xs text-gray-500 dark:text-glass-textSub">Report missing items or mark found items.</p>
            </div>
            <form onSubmit={handleAddLostFoundItem} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={lostFoundTitle} onChange={(e) => setLostFoundTitle(e.target.value)} placeholder="Item name" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <input value={lostFoundLocation} onChange={(e) => setLostFoundLocation(e.target.value)} placeholder="Location" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <div className="md:col-span-2 flex justify-end"><button className="h-9 px-4 bg-[#A084E8] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Submit Report</button></div>
            </form>
            <div className="space-y-2">
              {lostFoundItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold">{item.title}</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.location}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${item.type === 'Lost' ? 'text-rose-400' : 'text-[#8BE8CB]'}`}>{item.type}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-black tracking-tight">Side Projects</h4>
              <p className="text-xs text-gray-500 dark:text-glass-textSub">Share what you are building with the campus.</p>
            </div>
            <form onSubmit={handleAddProjectShare} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Project title" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <input value={projectLink} onChange={(e) => setProjectLink(e.target.value)} placeholder="Project link" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <div className="md:col-span-2 flex justify-end"><button className="h-9 px-4 bg-[#A084E8] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Share Project</button></div>
            </form>
            <div className="space-y-2">
              {projectShares.map((project) => (
                <a key={project.id} href={project.link} target="_blank" rel="noreferrer" className="block rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40 hover:border-[#A084E8]/30 transition-all">
                  <h5 className="text-xs font-bold">{project.title}</h5>
                  <p className="text-[10px] text-gray-500 mt-0.5">{project.owner}</p>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{project.summary}</p>
                </a>
              ))}
            </div>
          </div>
        );
      case 'picks':
        return (
          <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-black tracking-tight">Staff Picks</h4>
              <p className="text-xs text-gray-500 dark:text-glass-textSub">Curated tools and study methods.</p>
            </div>
            <form onSubmit={handleAddPick} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={pickTitle} onChange={(e) => setPickTitle(e.target.value)} placeholder="Pick title" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <input value={pickNotes} onChange={(e) => setPickNotes(e.target.value)} placeholder="Notes" className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 text-xs" />
              <div className="md:col-span-2 flex justify-end"><button className="h-9 px-4 bg-[#A084E8] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Add Pick</button></div>
            </form>
            <div className="space-y-2">
              {picks.map((pick) => (
                <div key={pick.id} className="rounded-xl border border-black/5 dark:border-white/[0.06] p-3 bg-white dark:bg-[#15121B]/40">
                  <h5 className="text-xs font-bold">{pick.title}</h5>
                  <p className="text-[10px] uppercase tracking-wider text-[#A084E8] mt-0.5">{pick.category}</p>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{pick.notes}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'topics':
      default:
        return (
          <div className="rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.02]">
            <h4 className="text-sm font-black tracking-tight">Community Feed Hub</h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-glass-textSub">Switch sections above to browse official posts, events, resources, internships, mentors, marketplace listings, lost items, projects, and staff picks.</p>
          </div>
        );
    }
  };

  const renderEventsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Events</h2>
          <p className="text-sm text-gray-500 dark:text-glass-textSub">Official campus events with RSVP tracking and detail cards.</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-[#A084E8] bg-[#A084E8]/10 px-3 py-1 rounded-full">Portal tab</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {eventCards.map((event) => {
          const expanded = expandedEventId === event.id;
          return (
            <article key={event.id} className="rounded-3xl border border-black/5 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-white/[0.03] shadow-sm">
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black tracking-tight">{event.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-glass-textSub">{event.date} · {event.time} · {event.location}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">{event.attendees}/{event.seats} going</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-glass-textSub">{event.summary}</p>
                {expanded && <p className="text-xs leading-6 text-gray-500 dark:text-glass-textSub">{event.details}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setExpandedEventId(expanded ? null : event.id)} className="h-9 px-3 rounded-xl border border-black/10 dark:border-white/[0.08] text-xs font-bold">{expanded ? 'Show Less' : 'Expand Details'}</button>
                  <button onClick={() => handleToggleEventAttendance(event.id, 'attend')} className={`h-9 px-3 rounded-xl text-xs font-bold ${event.attendance === 'attend' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>Attend</button>
                  <button onClick={() => handleToggleEventAttendance(event.id, 'skip')} className={`h-9 px-3 rounded-xl text-xs font-bold ${event.attendance === 'skip' ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'}`}>Skip</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );

  const renderInternshipsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Internships & Jobs</h2>
          <p className="text-sm text-gray-500 dark:text-glass-textSub">A social-style board for openings, likes, and quick applications.</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-[#A084E8] bg-[#A084E8]/10 px-3 py-1 rounded-full">Portal tab</span>
      </div>

      <div className="grid gap-4">
        {internshipCards.map((item) => (
          <article key={item.id} className="rounded-3xl border border-black/5 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#A084E8]">{item.type}</p>
                <h3 className="text-base font-black tracking-tight">{item.role}</h3>
                <p className="text-xs text-gray-500 dark:text-glass-textSub">{item.company} · Deadline {item.deadline}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-white/[0.06] px-2 py-1 rounded-full text-slate-600 dark:text-glass-textSub">{item.status}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-glass-textSub">{item.summary}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-glass-textSub">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/[0.05] px-2 py-1">{item.likes} likes</span>
              <button onClick={() => handleToggleInternshipLike(item.id)} className="h-8 px-3 rounded-xl border border-black/10 dark:border-white/[0.08] font-bold">Like Post</button>
              <button onClick={() => handleApplyInternship(item.id)} className="h-8 px-3 rounded-xl bg-[#A084E8] text-white font-bold">Apply</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  const renderMentorsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Mentors</h2>
          <p className="text-sm text-gray-500 dark:text-glass-textSub">Ask a senior, then move to a direct help thread when needed.</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-[#A084E8] bg-[#A084E8]/10 px-3 py-1 rounded-full">Portal tab</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mentorCards.map((mentor) => (
          <article key={mentor.id} className="rounded-3xl border border-black/5 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#A084E8]">Mentor request</p>
                <h3 className="text-base font-black tracking-tight">{mentor.topic}</h3>
                <p className="text-xs text-gray-500 dark:text-glass-textSub">Preferred: {mentor.preferredMentor}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-white/[0.06] px-2 py-1 rounded-full text-slate-600 dark:text-glass-textSub">{mentor.status}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-glass-textSub">Assigned senior: {mentor.senior} · {mentor.expertise}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => handleOpenMentorDm(mentor.senior)} className="h-9 px-3 rounded-xl bg-[#A084E8] text-white text-xs font-bold">Move to DMs</button>
              <button onClick={() => setSelectedTab(5)} className="h-9 px-3 rounded-xl border border-black/10 dark:border-white/[0.08] text-xs font-bold">Ask in AI Mentor</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );


  // --- LOGIN VIEW ---
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden transition-colors duration-300 ${isDarkTheme ? 'bg-[#0E0C12] text-glass-textDark' : 'bg-[#F7F8FC] text-slate-900'}`}>
        
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-900/10 dark:bg-purple-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-teal-900/10 dark:bg-teal-900/15 blur-[120px] pointer-events-none" />

        {/* Global Banner Notification */}
        {notificationBanner && (
          <div className="fixed top-6 right-6 left-6 md:left-auto md:w-[380px] z-50 p-4 rounded-2xl bg-purple-950/90 dark:bg-purple-900/90 border border-purple-500/20 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-xs text-[#A084E8] uppercase tracking-wider">{notificationBanner.title}</h4>
                <div className="text-xs text-white/95 mt-1 leading-relaxed">{renderFormattedText(notificationBanner.message, 'text-white/95')}</div>
              </div>
              <button onClick={() => setNotificationBanner(null)} className="text-white/60 hover:text-white ml-2">
                <X size={14} />
              </button>
            </div>
            <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#A084E8] transition-[width] duration-75 ease-linear" style={{ width: `${notificationProgress * 100}%` }} />
            </div>
          </div>
        )}

        {isIdScannerOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border ${isDarkTheme ? 'bg-[#15121B] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-start justify-between gap-4 p-5 border-b ${isDarkTheme ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Scan ID Card</h3>
                  <p className={`mt-1 text-xs leading-relaxed ${isDarkTheme ? 'text-glass-textSub' : 'text-slate-600'}`}>{scannerMessage}</p>
                </div>
                <button onClick={() => setIsIdScannerOpen(false)} className={`${isDarkTheme ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  <X size={18} />
                </button>
              </div>

              <input
                ref={scannerFileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleScannerUpload}
                className="hidden"
              />

              <div className="p-5 space-y-4">
                <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl border ${scannerStatus === 'error' ? 'border-rose-500/40' : 'border-[#A084E8]/25'} bg-black`}>
                  <video ref={scannerVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-6 rounded-3xl border-2 border-dashed border-white/75" />
                    <div className="absolute inset-x-10 top-1/2 h-px bg-[#A084E8]/80 animate-pulse" />
                    <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {scannerStatus === 'requesting' ? 'Requesting Camera' : scannerStatus === 'processing' ? 'Reading Card' : scannerStatus === 'error' ? 'Needs Attention' : 'Camera Ready'}
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 text-xs leading-relaxed ${isDarkTheme ? 'bg-white/[0.03] border-white/[0.06] text-gray-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#A084E8]" />
                    <p>This reader is for NUTECH registration cards. It reads the printed NAME and ID from the card photo to login securely</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={captureAndScanCamera}
                    disabled={scannerStatus === 'processing' || scannerStatus === 'requesting'}
                    className="h-11 rounded-xl bg-[#A084E8] hover:bg-[#8f70df] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Camera size={14} />
                    Scan Card Now
                  </button>
                  <button
                    type="button"
                    onClick={() => scannerFileInputRef.current?.click()}
                    disabled={scannerStatus === 'processing' || scannerStatus === 'requesting'}
                    className={`h-11 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${isDarkTheme ? 'border-white/[0.08] hover:bg-white/[0.04] text-white disabled:text-white/40' : 'border-slate-200 hover:bg-slate-100 text-slate-800 disabled:text-slate-400'}`}
                  >
                    <ImageIcon size={14} />
                    Upload NUTECH ID
                  </button>
                </div>

                {scannerStatus === 'error' && (
                  <div className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-200">
                    <CameraOff size={14} className="mt-0.5 shrink-0" />
                    <p>{scannerMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`w-full max-w-md rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 shadow-2xl ${isDarkTheme ? 'bg-white/5 dark:bg-[#15121B]/40 border border-black/5 dark:border-white/[0.06]' : 'bg-white border border-slate-200'}`}>
          
          <div className="text-center mb-6">
            <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-[#A084E8]/20 text-[#A084E8] mb-3">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">NUTECH Connect</h1>
            <p className={`text-xs mt-1 ${isDarkTheme ? 'text-glass-textSub' : 'text-slate-600'}`}>Smart Student Portal & Unified Campus Hub</p>
          </div>

          {!otpStep ? (
            <div className="space-y-5">
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkTheme ? 'text-glass-textSub' : 'text-slate-600'}`}>University Student Login</label>
                  <input 
                    type="email" 
                    placeholder="e.g. f25609038@nutech.edu.pk"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full h-11 px-4 text-sm rounded-xl border focus:outline-none focus:border-[#A084E8] focus:ring-1 focus:ring-[#A084E8] transition-all ${isDarkTheme ? 'border-white/[0.08] bg-white/[0.04] text-white placeholder:text-glass-textSub' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkTheme ? 'text-glass-textSub' : 'text-slate-600'}`}>Student Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ali Shahnawaz"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className={`w-full h-11 px-4 text-sm rounded-xl border focus:outline-none focus:border-[#A084E8] focus:ring-1 focus:ring-[#A084E8] transition-all ${isDarkTheme ? 'border-white/[0.08] bg-white/[0.04] text-white placeholder:text-glass-textSub' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
                  />
                </div>
                <button type="submit" className="w-full h-11 bg-[#A084E8] hover:bg-[#8f70df] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
                  Send Verification OTP
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className={`flex-grow border-t ${isDarkTheme ? 'border-white/[0.08]' : 'border-slate-200'}`}></div>
                <span className={`flex-shrink mx-4 text-[10px] uppercase tracking-widest ${isDarkTheme ? 'text-glass-textSub' : 'text-slate-500'}`}>or bypass option</span>
                <div className={`flex-grow border-t ${isDarkTheme ? 'border-white/[0.08]' : 'border-slate-200'}`}></div>
              </div>

              {/* Fast logins */}
              <div className="space-y-2">
                <button 
                  onClick={handleOpenIdScanner}
                  className="w-full h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  <ScanLine size={14} />
                  Scan ID Card with Camera
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleGoogleLogin}
                    className={`h-10 border font-medium text-xs rounded-xl flex justify-center items-center gap-1.5 transition-all ${isDarkTheme ? 'border-white/[0.08] hover:bg-white/[0.04] text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-800'}`}
                  >
                    <span>Google Sign In</span>
                  </button>
                  <button 
                    onClick={handleAnonymousBrowse}
                    className={`h-10 border font-medium text-xs rounded-xl flex justify-center items-center gap-1.5 transition-all ${isDarkTheme ? 'border-white/[0.08] hover:bg-white/[0.04] text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-800'}`}
                  >
                    <span>Browse as Guest</span>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <a 
                  href="https://www.linkedin.com/in/ali-shahnawaz-0470ab3a3/"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1 text-[11px] transition-all ${isDarkTheme ? 'text-glass-textSub hover:text-[#A084E8]' : 'text-slate-600 hover:text-[#7C57D1]'}`}
                >
                  Connect on LinkedIn <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-3 rounded-xl text-xs leading-relaxed text-center border ${isDarkTheme ? 'bg-purple-500/10 border-purple-500/20 text-[#A084E8]' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                We have simulated sending a verification email to <span className="font-bold">{loginEmail}</span>.
                Check the top-right notification banner for your OTP!
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkTheme ? 'text-glass-textSub' : 'text-slate-600'}`}>Enter verification code</label>
                  <input 
                    type="text" 
                    placeholder="6-digit OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className={`w-full h-11 text-center font-bold tracking-widest text-lg rounded-xl border focus:outline-none focus:border-[#A084E8] transition-all ${isDarkTheme ? 'border-white/[0.08] bg-white/[0.04] text-white placeholder:text-glass-textSub' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setOtpStep(false); setOtpCode(""); }}
                    className={`w-1/3 h-11 border font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${isDarkTheme ? 'border-white/[0.08] hover:bg-white/[0.04] text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-800'}`}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="w-2/3 h-11 bg-[#A084E8] hover:bg-[#8f70df] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                  >
                    Confirm Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }


  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkTheme ? 'bg-[#0E0C12] text-glass-textDark' : 'bg-[#F7F8FC] text-slate-900'}`}>
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[50%] h-[30%] rounded-full bg-purple-900/5 dark:bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[30%] rounded-full bg-teal-900/5 dark:bg-teal-900/5 blur-[150px] pointer-events-none" />

      {/* Header Notification Banner */}
      {notificationBanner && (
        <div className={`fixed top-6 right-6 left-6 md:left-auto md:w-[380px] z-50 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${isDarkTheme ? 'bg-[#1A1625] border-purple-500/20' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <span className="text-base">🔔</span>
              <div>
                <h4 className="font-bold text-xs text-[#A084E8] uppercase tracking-wider">{notificationBanner.title}</h4>
                <div className={`text-xs mt-1 leading-relaxed ${isDarkTheme ? 'text-white/95' : 'text-slate-700'}`}>{renderFormattedText(notificationBanner.message, isDarkTheme ? 'text-white/95' : 'text-slate-700')}</div>
              </div>
            </div>
            <button onClick={() => setNotificationBanner(null)} className={`${isDarkTheme ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'} ml-2`}>
              <X size={14} />
            </button>
          </div>
          <div className={`mt-3 h-1 rounded-full overflow-hidden ${isDarkTheme ? 'bg-white/10' : 'bg-slate-200'}`}>
            <div className="h-full bg-[#A084E8] transition-[width] duration-75 ease-linear" style={{ width: `${notificationProgress * 100}%` }} />
          </div>
        </div>
      )}

      {/* Main Grid Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between ${isDarkTheme ? 'bg-white/5 dark:bg-[#15121B]/40 border-b border-black/5 dark:border-white/[0.06]' : 'bg-white/90 border-b border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#A084E8]/20 text-[#A084E8] flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight">NUTECH Connect</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-gray-500 dark:text-glass-textSub uppercase tracking-wider font-semibold">Campus Net Active</p>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Gemini model toggle */}
          <button 
            onClick={() => {
              setIsOfflineMode(!isOfflineMode);
              setNotificationBanner({
                title: !isOfflineMode ? "🤖 Offline Engine Engaged" : "🌐 Live Gemma 4 API Connected",
                message: !isOfflineMode 
                  ? "Switched to Gemma 4 local core . Fully free & unlimited!" 
                  : "Switched to Live Google Gemma 4 API. Set VITE_GEMINI_API_KEY on Vercel or save a local key to use it."
              });
            }}
            className={`px-3 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
              isOfflineMode 
                ? 'bg-purple-500/10 border-purple-500/20 text-[#A084E8]' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
            title={isOfflineMode ? "Click to switch to Online Gemini API" : "Click to switch to Free Offline Model"}
          >
            {isOfflineMode ? <WifiOff size={11} /> : <Wifi size={11} />}
            {isOfflineMode ? "Offline Gemma 4" : "Live Gemini"}
          </button>

          {/* Theme switcher */}
          <button 
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/[0.08] hover:bg-gray-100 dark:hover:bg-white/[0.04] flex items-center justify-center transition-all"
          >
            {isDarkTheme ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User badge */}
          <button 
            onClick={() => setShowProfileDialog(true)}
            className="w-8 h-8 rounded-full border border-[#A084E8]/30 hover:border-[#A084E8] bg-purple-500/10 text-base flex items-center justify-center transition-all"
            title="View Student Profile Card"
          >
            {currentUser.isUniversityStudent ? "🎓" : "👤"}
          </button>
        </div>
      </header>

      {/* Main layout frame */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 gap-4 overflow-hidden">
        
        {/* Navigation Sidebar (Desktop view) */}
        <nav className={`hidden md:flex flex-col gap-1.5 w-60 shrink-0 rounded-3xl p-4 h-fit ${isDarkTheme ? 'bg-white/5 dark:bg-[#15121B]/30 border border-black/5 dark:border-white/[0.05]' : 'bg-white/90 border border-slate-200'}`}>
          <div className={`px-3 py-1 mb-2 text-[10px] uppercase tracking-widest font-bold ${isDarkTheme ? 'text-gray-500 dark:text-glass-textSub' : 'text-slate-500'}`}>Portal Menu</div>
          {[
            { id: 0, label: "Social Feed", icon: Compass },
            { id: 1, label: "Events", icon: Calendar },
            { id: 2, label: "Internships & Jobs", icon: FileSpreadsheet },
            { id: 3, label: "Mentors", icon: MessageSquare },
            { id: 4, label: "GPA Calculator", icon: Calculator },
            { id: 5, label: "AI Mentor Guidance", icon: HelpCircle },
            { id: 6, label: "Daily Digest Briefing", icon: FileText }
          ].map((tab) => {
            const IconComp = tab.icon;
            const active = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`w-full h-11 px-4 text-xs font-bold tracking-wide rounded-xl flex items-center gap-3 transition-all ${
                  active 
                    ? 'bg-[#A084E8] text-white shadow-lg shadow-purple-500/10' 
                    : 'text-gray-500 dark:text-glass-textSub hover:bg-gray-100 dark:hover:bg-white/[0.03] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <IconComp size={16} />
                {tab.label}
              </button>
            );
          })}

          <div className="border-t border-gray-200 dark:border-white/[0.08] my-3"></div>

          <button 
            onClick={handleLogout}
            className="w-full h-11 px-4 text-xs font-bold text-rose-500 hover:bg-rose-500/5 rounded-xl flex items-center gap-3 transition-all"
          >
            <LogOut size={16} />
            Logout Account
          </button>
        </nav>

        {/* Dynamic content view board */}
        <main className={`flex-grow rounded-3xl p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-120px)] relative ${isDarkTheme ? 'bg-white/5 dark:bg-[#15121B]/20 border border-black/5 dark:border-white/[0.05]' : 'bg-white/90 border border-slate-200'}`}>
          
          {/* TAB 0: SOCIAL FEED */}
          {selectedTab === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Fact-Checked Social Feed</h3>
                  <p className="text-xs text-gray-500 dark:text-glass-textSub mt-0.5">Filter rumors instantly, connect directly with classmates</p>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 dark:border-white/[0.06] p-4 bg-gradient-to-r from-purple-500/10 to-emerald-500/10 dark:from-purple-500/10 dark:to-emerald-500/10 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black tracking-tight">Anonymous Reporting</h4>
                    <p className="text-xs text-gray-500 dark:text-glass-textSub">Report a campus issue without showing your name.</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">Private</span>
                </div>
                <form onSubmit={handleSubmitAnonymousReport} className="space-y-2">
                  <textarea
                    value={anonymousReportInput}
                    onChange={(e) => setAnonymousReportInput(e.target.value)}
                    placeholder="Describe the issue, location, or concern..."
                    className="w-full h-20 text-xs p-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0C12]/50 focus:outline-none focus:border-[#A084E8] resize-none"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="h-9 px-4 bg-[#A084E8] hover:bg-[#8f70df] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all">Send Report</button>
                  </div>
                </form>
              </div>

              <div className="flex flex-wrap gap-2">
                {COMMUNITY_SECTIONS.map((section) => {
                  const active = selectedHubSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedHubSection(section.id)}
                      className={`px-3 py-2 rounded-xl border text-left transition-all ${active ? 'bg-[#A084E8] border-[#A084E8] text-white shadow-lg shadow-purple-500/10' : section.id === 'announcements' ? 'bg-amber-500/10 border-amber-400/30 text-amber-700 dark:text-amber-300 hover:border-amber-400/50' : 'bg-white/60 dark:bg-white/[0.03] border-black/5 dark:border-white/[0.06] text-gray-600 dark:text-glass-textSub hover:border-[#A084E8]/30'}`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider">{section.label}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">{section.description}</div>
                    </button>
                  );
                })}
              </div>

              {renderHubSectionContent()}

              {/* Feed input */}
              <form onSubmit={handlePublishPost} className="p-4 bg-white/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.06] rounded-2xl space-y-3 shadow-lg">
                <textarea 
                  placeholder="Share a campus update, exam dates, study groups, etc. Use a specific tag like #Exams or #Deadlines to categorize your post and trigger an AI fact-check!"
                  value={feedInput}
                  onChange={(e) => setFeedInput(e.target.value)}
                  className="w-full h-20 text-xs p-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-[#0E0C12]/50 focus:outline-none focus:border-[#A084E8] resize-none"
                  required
                />
                <div className="flex justify-end">
                  <button type="submit" className="h-9 px-4 bg-[#A084E8] hover:bg-[#8f70df] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5">
                    <Plus size={14} />
                    Post Bulletin
                  </button>
                </div>
              </form>

              {/* Grid of feed + class chats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Feed posts */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#A084E8] mb-1">Live Campus Bulletins</div>
                  {posts.map((post) => {
                    const fc = getLocalFactCheck(post.content);
                    const isRumor = fc.verificationStatus === "UNVERIFIED_RUMOR";
                    const isVerified = fc.verificationStatus === "VERIFIED";

                    return (
                      <div key={post.id} className="p-4 bg-white/10 dark:bg-[#1A1625]/40 border border-black/5 dark:border-white/[0.06] rounded-2xl space-y-3 shadow-md relative group">
                        
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-[#A084E8]/20 flex items-center justify-center font-bold text-xs">
                              {post.authorName[0]}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold flex items-center gap-1">
                                {post.authorName}
                                {(post.authorRole.includes("Registrar") || post.authorRole.includes("Admin")) && (
                                  <span className="inline-flex items-center gap-1 text-[9px] bg-[#A084E8]/20 text-[#A084E8] px-1 rounded font-semibold">
                                    <GraduationCap size={10} />
                                    Teacher
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-gray-500 dark:text-glass-textSub mt-0.5">{post.authorRole} • {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>

                          {/* Delete */}
                          {post.authorName === currentUser?.name && (
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="text-gray-400 hover:text-rose-500 transition-all p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Content text */}
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-glass-textDark">{post.content}</p>

                        {/* Bulletproof automated fact check banner */}
                        <div className={`p-3 rounded-xl border flex items-start gap-2 text-[11px] leading-relaxed transition-all ${
                          isRumor 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                            : isVerified 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-purple-500/5 border-purple-500/10 text-purple-400'
                        }`}>
                          {isRumor ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}
                          <div>
                            <span className="font-extrabold uppercase text-[9px] tracking-wider block mb-0.5">{fc.verificationStatus} FILTER FLAG ({fc.verificationSource})</span>
                            {fc.verificationText}
                          </div>
                        </div>

                        {/* Actions line */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1 hover:text-[#A084E8] transition-all ${post.isLiked ? 'text-[#A084E8] font-bold' : ''}`}
                          >
                            <span>👍</span>
                            <span>{post.likes} Likes</span>
                          </button>
                          <div className="flex items-center gap-1">
                            <span>💬</span>
                            <span>{post.commentsCount} Comments</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Class discussions right panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#8BE8CB] mb-1">Campus Department Chats</div>
                  
                  <div className="bg-[#1A1625]/20 border border-black/5 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-lg h-[460px] flex flex-col">
                    
                    {/* Chat tabs header */}
                    <div className="grid grid-cols-3 border-b border-black/5 dark:border-white/[0.06] bg-black/10">
                      {DEPARTMENTS.map(dept => (
                        <button 
                          key={dept}
                          onClick={() => setActiveChatDept(dept)}
                          className={`py-2 text-[9px] font-extrabold uppercase tracking-wider text-center border-b-2 transition-all ${
                            activeChatDept === dept 
                              ? 'border-[#8BE8CB] text-[#8BE8CB] bg-[#8BE8CB]/5' 
                              : 'border-transparent text-gray-500 hover:text-white'
                          }`}
                        >
                          {dept.replace("Computer ", "CS ").replace("Software ", "SE ").replace("Cyber ", "Cyber ")}
                        </button>
                      ))}
                    </div>

                    {/* Chat messages */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-3.5">
                      {classChatMessages[activeChatDept]?.map((msg) => (
                        <div key={msg.id} className="space-y-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[11px] font-black text-[#8BE8CB]">{msg.sender}</span>
                            <span className="text-[9px] text-gray-500">
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-xs p-2.5 rounded-xl bg-white/5 dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] leading-relaxed text-gray-300">
                            {msg.text}
                          </p>
                        </div>
                      ))}
                      <div ref={classChatBottomRef} />
                    </div>

                    {/* Chat Input */}
                    {currentUser.isUniversityStudent ? (
                      <form onSubmit={handlePublishClassChat} className="p-2 border-t border-black/5 dark:border-white/[0.06] flex gap-1.5 bg-black/10">
                        <input 
                          type="text"
                          placeholder={`Message in ${activeChatDept}...`}
                          value={classChatInput}
                          onChange={(e) => setClassChatInput(e.target.value)}
                          className="flex-grow h-9 text-xs px-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-[#0E0C12] focus:outline-none"
                        />
                        <button type="submit" className="w-9 h-9 bg-[#8BE8CB] hover:bg-[#72cbae] text-black rounded-lg flex items-center justify-center transition-all">
                          <Send size={14} />
                        </button>
                      </form>
                    ) : (
                      <div className="p-3 border-t border-white/5 bg-rose-500/5 text-[10px] text-rose-400 font-bold text-center leading-normal">
                        🔒 Campus class chats are locked for guest views. Login with a NUTECH Student Email to unlock.
                      </div>
                    )}

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 1: EVENTS */}
          {selectedTab === 1 && renderEventsTab()}

          {/* TAB 2: INTERNSHIPS & JOBS */}
          {selectedTab === 2 && renderInternshipsTab()}

          {/* TAB 3: MENTORS */}
          {selectedTab === 3 && renderMentorsTab()}

          {/* TAB 4: GPA CALCULATOR */}
          {selectedTab === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-200 dark:border-white/[0.08] pb-4">
                <h3 className="text-lg font-black tracking-tight">GPA Calculator & Academic Standing</h3>
                <p className="text-xs text-gray-500 dark:text-glass-textSub mt-0.5">Semester course record tracking, instant merit scholarship check, and study counselling</p>
              </div>

              {/* Cumulative GPA Card */}
              <div className="p-5 bg-white/10 dark:bg-[#1A1625]/40 border border-black/5 dark:border-white/[0.06] rounded-3xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-glass-textSub">My Cumulative GPA</span>
                    <h2 className={`text-5xl font-black ${cgpa >= 3.5 ? 'text-emerald-400' : cgpa >= 3.0 ? 'text-[#A084E8]' : 'text-rose-400'}`}>
                      {cgpa.toFixed(2)}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-glass-textSub">Total Registered Credit Hours: {totalCredits}</p>
                  </div>

                  {/* Standing indicator */}
                  <div className="p-3 bg-white/5 dark:bg-[#0E0C12]/40 rounded-2xl border border-black/5 dark:border-white/[0.05] flex flex-col items-center justify-center w-40 text-center h-24 shrink-0">
                    <span className="text-2xl">
                      {cgpa >= 3.7 ? "🏆" : cgpa >= 3.5 ? "⭐" : cgpa >= 3.0 ? "👍" : cgpa >= 2.0 ? "📈" : "⚠️"}
                    </span>
                    <h4 className="text-xs font-black text-white mt-1 leading-none">
                      {cgpa === 0 ? "No GPA Yet" : cgpa >= 3.7 ? "Dean's List / Gold" : cgpa >= 3.5 ? "Scholarship Safe" : cgpa >= 3.0 ? "Good Standing" : "Needs Push"}
                    </h4>
                    <p className="text-[10px] text-gray-500 uppercase mt-1 font-semibold">Scholarship Standing</p>
                  </div>
                </div>

                {/* Encouragement prompt block */}
                <div className="p-3 rounded-xl border border-[#A084E8]/20 bg-[#A084E8]/5 flex items-center gap-2.5 text-xs text-gray-700 dark:text-glass-textDark leading-relaxed">
                  <Info size={15} className="text-[#A084E8] shrink-0" />
                  <span>
                    {cgpa === 0 
                      ? "Add your semester courses below to track your CGPA and unlock automated AI mentoring advice!" 
                      : cgpa >= 3.7 
                      ? "Outstanding academic distinction! You are safely on the NUTECH Dean's List. Keep up this magnificent standard!" 
                      : cgpa >= 3.5 
                      ? "Excellent! You are currently meeting the CGPA requirement for the NUTECH Merit Scholarship (CGPA >= 3.5). Keep it up!" 
                      : cgpa >= 3.0 
                      ? "Great standing! You are very close to the 3.5 CGPA scholarship threshold. Push a little extra this semester to secure it!" 
                      : "Critical: Under minimum GPA guidelines. Utilize NUTECH repeats to recover."}
                  </span>
                </div>

                <button 
                  onClick={handleAskAiAboutGpa}
                  className="w-full h-11 bg-[#A084E8] hover:bg-[#8f70df] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                >
                  <Sparkles size={14} />
                  Ask AI for NUTECH Policy Counseling
                </button>
              </div>

              {/* Course Forms and lists */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side Add Course form */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-purple-400">Add Course Entry</div>
                  
                  <form onSubmit={handleAddCourse} className="p-4 bg-white/5 dark:bg-[#1A1625]/20 border border-black/5 dark:border-white/[0.06] rounded-2xl space-y-3.5 shadow-sm">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-glass-textSub mb-1.5">Semester Term</label>
                      <select 
                        value={gpaSemester}
                        onChange={(e) => setGpaSemester(Number(e.target.value))}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/[0.08] bg-[#0E0C12] focus:outline-none focus:border-[#A084E8]"
                      >
                        {[1, 2, 3, 4].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-glass-textSub">Course Name</label>
                        <span className="text-[9px] text-[#A084E8] font-bold">Fast selection below</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder="e.g. Programming Fundamentals"
                        value={gpaCourseName}
                        onChange={(e) => setGpaCourseName(e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/[0.08] bg-[#0E0C12] focus:outline-none focus:border-[#A084E8]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-glass-textSub mb-1.5">Credit Hours</label>
                        <select 
                          value={gpaCreditHours}
                          onChange={(e) => setGpaCreditHours(Number(e.target.value))}
                          className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/[0.08] bg-[#0E0C12] focus:outline-none"
                        >
                          {[2, 3, 4].map(c => <option key={c} value={c}>{c} Credits</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-glass-textSub mb-1.5">Expected Grade</label>
                        <select 
                          value={gpaGrade}
                          onChange={(e) => setGpaGrade(e.target.value)}
                          className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/[0.08] bg-[#0E0C12] focus:outline-none"
                        >
                          {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].map(g => <option key={g} value={g}>Grade {g}</option>)}
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
                      Add Course
                    </button>
                  </form>

                  {/* Predefined selection lists */}
                  <div className="p-4 bg-white/5 dark:bg-[#1A1625]/20 border border-black/5 dark:border-white/[0.06] rounded-2xl space-y-2 shadow-sm">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-glass-textSub">Select NUTECH Syllabus Template</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {PREDEFINED_COURSES[gpaSemester]?.map(c => (
                        <button
                          key={c.name}
                          onClick={() => handleAddPredefinedCourse(c.name, c.credits)}
                          className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-[11px] flex justify-between items-center transition-all"
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-gray-500">{c.credits} Credit Hours</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right side course table listing */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <div className="text-xs font-bold uppercase tracking-widest text-[#A084E8]">Tracked Semester Courses</div>
                    {courses.length > 0 && (
                      <button 
                        onClick={handleClearCalculator}
                        className="text-[10px] text-rose-400 font-bold hover:underline"
                      >
                        Reset Table
                      </button>
                    )}
                  </div>

                  {courses.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500 dark:text-glass-textSub">No courses added. Choose a semester template and add entries to see them listed here.</div>
                  ) : (
                    <div className="space-y-3">
                      {/* Group courses by semester */}
                      {[1, 2, 3, 4].map(sem => {
                        const semCourses = courses.filter(c => c.semester === sem);
                        if (semCourses.length === 0) return null;
                        return (
                          <div key={sem} className="space-y-1.5">
                            <span className="block text-[10px] font-extrabold text-[#A084E8] uppercase tracking-wider">Semester {sem}</span>
                            <div className="space-y-1.5">
                              {semCourses.map(c => (
                                <div key={c.id} className="p-3 bg-white/5 dark:bg-[#1A1625]/20 border border-black/5 dark:border-white/[0.06] rounded-xl flex justify-between items-center text-xs shadow-sm">
                                  <div>
                                    <h5 className="font-bold">{c.courseName}</h5>
                                    <span className="text-[10px] text-gray-500">{c.creditHours} Credits • Grade: {c.grade} ({c.gradePoints.toFixed(1)} GP)</span>
                                  </div>
                                  <button onClick={() => handleRemoveCourse(c.id)} className="text-gray-400 hover:text-rose-500 transition-all p-1.5">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: AI MENTOR GUIDANCE */}
          {selectedTab === 5 && (
            <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-160px)]">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-lg font-black tracking-tight">AI Mentor & Policy Counselling</h3>
                  <p className="text-xs text-gray-500 dark:text-glass-textSub mt-0.5">Offline Gemma 4 simulator & live calendar query system</p>
                </div>
                <button 
                  onClick={handleClearChat}
                  className="text-xs text-gray-500 dark:text-glass-textSub font-bold hover:underline"
                >
                  Clear Chat
                </button>
              </div>

              {/* Chat Container layout */}
              <div className="flex-grow overflow-y-auto space-y-4 p-4 rounded-2xl bg-black/10 border border-black/5 dark:border-white/[0.04]">
                {chatHistory.map((msg) => {
                  const isAi = msg.sender === 'AI';
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 max-w-[85%] ${isAi ? 'self-start' : 'ml-auto flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isAi ? 'bg-purple-500/10 border border-[#A084E8]/20 text-[#A084E8]' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                        {isAi ? "🤖" : "👤"}
                      </div>
                      <div className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed border ${
                        isAi 
                          ? 'bg-[#1A1625]/60 border-[#A084E8]/10 text-gray-200' 
                          : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-100'
                      }`}>
                        <div className="space-y-1.5">
                          {renderFormattedText(msg.text, isAi ? 'text-gray-200' : 'text-emerald-100')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="flex items-center gap-2 p-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full border-2 border-t-purple-500 border-purple-500/10 animate-spin" />
                    <span>Gemma 4 is formulating advice...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Smart policy shortcut chips */}
              <div className="space-y-1.5 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-glass-textSub">Policy Smart Queries</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Is midterms delayed?",
                    "What is the attendance policy?",
                    "What are the scholarship requirements?",
                    "CS-202 makeup lab schedule?",
                    "Fee submission deadline?",
                    "Transport services route?"
                  ].map((chip) => (
                    <button 
                      key={chip}
                      onClick={() => sendChatMessage(chip)}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-purple-500/5 hover:bg-[#A084E8]/20 border border-[#A084E8]/15 text-[#A084E8] font-bold transition-all"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat form field input */}
              <form onSubmit={handleSendChatMessageForm} className="flex gap-2 shrink-0">
                <input 
                  type="text" 
                  placeholder="Ask your AI Mentor about midterms, fees, scholarship CGPA requirements..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow h-11 px-4 text-xs rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] focus:outline-none focus:border-[#A084E8]"
                  required
                />
                <button type="submit" className="h-11 px-5 bg-[#A084E8] hover:bg-[#8f70df] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2">
                  <Send size={14} />
                  Send Query
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: DAILY DIGEST BRIEFING */}
          {selectedTab === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-200 dark:border-white/[0.08] pb-4">
                <h3 className="text-lg font-black tracking-tight">Daily Digest News Synthesis</h3>
                <p className="text-xs text-gray-500 dark:text-glass-textSub mt-0.5">Automated campus digest compiler powered by offline LLM</p>
              </div>

              <div className="p-5 bg-white/10 dark:bg-[#1A1625]/40 border border-black/5 dark:border-white/[0.06] rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-[#8BE8CB] flex items-center justify-center font-bold">
                    📰
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-400">Campus Digest Compiler</h4>
                    <p className="text-[11px] text-gray-500 dark:text-glass-textSub mt-0.5">Summarize all bulletins, deadlines, fee dates, and activities automatically</p>
                  </div>
                </div>

                <button 
                  onClick={handleLoadDailyDigest}
                  disabled={isSynthesizingDigest}
                  className="w-full h-11 bg-[#8BE8CB] hover:bg-[#72cbae] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-teal-500/10"
                >
                  {isSynthesizingDigest ? "Generating campus synthesis digest..." : "Synthesize Daily Campus Digest"}
                </button>
              </div>

              {dailyDigest && (
                <div className="p-5 bg-white/5 dark:bg-[#1A1625]/20 border border-black/5 dark:border-white/[0.06] rounded-3xl space-y-4 shadow-lg animate-fade-in">
                  <div className="flex justify-between items-baseline border-b border-white/5 pb-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">Briefing Summary Report</span>
                    <span className="text-[10px] text-gray-500">Structured Campus State</span>
                  </div>

                  <div className="text-xs leading-relaxed text-gray-300 space-y-3 font-mono">
                    {dailyDigest.split('\n').map((line, i) => (
                      <p key={i}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* Profile Dialog modal card */}
      {showProfileDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className={`rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-fade-in ${isDarkTheme ? 'bg-[#15121B] border border-white/[0.08]' : 'bg-white border border-slate-200'}`}>
            
            <button 
              onClick={() => setShowProfileDialog(false)} 
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-4">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-purple-500/15 text-[#A084E8] text-2xl font-black shadow-md border border-[#A084E8]/20">
                {currentUser.name[0]}
              </div>
              
              <div>
                <h3 className={`text-sm font-black ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block ${isDarkTheme ? 'bg-purple-500/15 text-[#A084E8] border border-[#A084E8]/20' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                  {currentUser.isUniversityStudent ? "Verified University Student" : "Guest Viewer"}
                </span>
              </div>

                <div className={`border-t pt-4 space-y-2.5 text-xs text-left ${isDarkTheme ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="flex justify-between">
                    <span className={isDarkTheme ? 'text-gray-500' : 'text-slate-600'}>Student Email</span>
                    <span className={`font-bold font-mono ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{currentUser.email}</span>
                </div>
                {currentUser.isUniversityStudent && (
                  <>
                    <div className="flex justify-between">
                        <span className={isDarkTheme ? 'text-gray-500' : 'text-slate-600'}>Academic Batch</span>
                        <span className="font-bold text-[#A084E8]">{currentUser.batch}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={isDarkTheme ? 'text-gray-500' : 'text-slate-600'}>Department</span>
                        <span className={`font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{currentUser.department}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={isDarkTheme ? 'text-gray-500' : 'text-slate-600'}>Roll Number Sequence</span>
                        <span className="font-bold text-[#8BE8CB] font-mono">{currentUser.rollNumber}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                    <span className={isDarkTheme ? 'text-gray-500' : 'text-slate-600'}>Authentication Method</span>
                    <span className={`font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{currentUser.authType}</span>
                </div>
              </div>

                <div className={`p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-2 ${isDarkTheme ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className="w-24 h-24 bg-white p-1 rounded-xl shadow-lg flex items-center justify-center">
                  {/* simulated secure campus pass QR */}
                  <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center gap-1">
                    <span className="text-[10px] text-[#A084E8] uppercase tracking-widest font-black">NUTECH</span>
                    <span className="text-[8px] text-emerald-400 font-bold font-mono">PASS OK</span>
                  </div>
                </div>
                  <p className={isDarkTheme ? 'text-[10px] text-gray-500 leading-normal text-center' : 'text-[10px] text-slate-600 leading-normal text-center'}>NUTECH Connect Dynamic ID Pass. Regenerates every 60 seconds.</p>
              </div>

                <a
                  href="https://www.linkedin.com/in/ali-shahnawaz-0470ab3a3/"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center justify-center gap-1 text-[11px] transition-all pt-1 ${isDarkTheme ? 'text-glass-textSub hover:text-[#A084E8]' : 'text-slate-600 hover:text-[#7C57D1]'}`}
                >
                  Connect on LinkedIn <ExternalLink size={10} />
                </a>

            </div>

          </div>
        </div>
      )}

      {/* Navigation bottom bar (Mobile view) */}
      <footer className={`sticky bottom-0 z-40 md:hidden backdrop-blur-md grid grid-cols-7 h-16 shrink-0 ${isDarkTheme ? 'bg-white/5 dark:bg-[#15121B]/95 border-t border-black/5 dark:border-white/[0.06]' : 'bg-white/95 border-t border-slate-200'}`}>
        {[
          { id: 0, label: "Feed", icon: Compass },
          { id: 1, label: "Events", icon: Calendar },
          { id: 2, label: "Jobs", icon: FileSpreadsheet },
          { id: 3, label: "Mentors", icon: MessageSquare },
          { id: 4, label: "GPA", icon: Calculator },
          { id: 5, label: "AI", icon: HelpCircle },
          { id: 6, label: "Digest", icon: FileText }
        ].map((tab) => {
          const IconComp = tab.icon;
          const active = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[72px] px-2 transition-all ${
                active ? 'text-[#A084E8] font-bold' : 'text-gray-500 dark:text-glass-textSub'
              }`}
            >
              <IconComp size={18} />
              <span className="text-[9px] uppercase tracking-wider font-extrabold">{tab.label}</span>
            </button>
          );
        })}
      </footer>

    </div>
  );
};

// Mount root React App
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
