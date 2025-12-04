
import React, { useState, useMemo, useEffect, createContext, useContext, useRef } from 'react';
import { 
  LayoutDashboard, 
  Mail, 
  Settings, 
  Users, 
  History, 
  Menu, 
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  Edit2,
  Send,
  Plus,
  Moon,
  Sun,
  Copy,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Info,
  Bold,
  Italic,
  Link2 as LinkIcon
} from 'lucide-react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import { INITIAL_EMAIL_TYPES } from './constants';
import { EmailType, Language, EmailCategory, EmailLog, Subscriber, AppSettings, EmailTemplate } from './types';
import { MOCK_LOGS, MOCK_SUBSCRIBERS } from './services/mockService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- Toast Context ---

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-fade-in-up ${
              toast.type === 'success' ? 'bg-green-600' : 
              toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
             toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : 
             <Info className="w-4 h-4" />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

// --- Theme Context ---

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });

const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- Shared Components ---

interface BadgeProps {
  children?: React.ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
}

const Badge = ({ children, variant }: BadgeProps) => {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
};

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
    {children}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-scale-up">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

// 1. Dashboard

const BAR_DATA = [
  { name: 'Sent', value: 850 },
  { name: 'Opened', value: 420 },
  { name: 'Clicked', value: 180 },
  { name: 'Failed', value: 12 },
];

const PIE_DATA = [
  { name: 'Success', value: 92 },
  { name: 'Bounced', value: 3 },
  { name: 'Spam', value: 1 },
  { name: 'Deferred', value: 4 },
];

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

const Dashboard = () => {
  const stats = [
    { label: 'Total Sent (30d)', value: '12,450', change: '+12%', icon: Send, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Delivery Rate', value: '99.2%', change: '+0.1%', icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Newsletter Subscribers', value: '3,840', change: '+24%', icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Pending Confirmations', value: '145', change: '-5%', icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className={`mt-2 text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {stat.change} <span className="text-slate-400 dark:text-slate-500">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Email Performance (Last 24h)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgb(30, 41, 59)', borderColor: 'rgb(51, 65, 85)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Delivery Status Distribution</h2>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgb(30, 41, 59)', borderColor: 'rgb(51, 65, 85)', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

// 2. Email Types List
const EmailTypes = () => {
  const [types, setTypes] = useState<EmailType[]>(INITIAL_EMAIL_TYPES);
  const [filter, setFilter] = useState<'ALL' | EmailCategory>('ALL');
  const { addToast } = useToast();
  
  const filteredTypes = useMemo(() => {
    if (filter === 'ALL') return types;
    return types.filter(t => t.category === filter);
  }, [types, filter]);

  const toggleStatus = (id: string) => {
    setTypes(prev => prev.map(t => {
      if (t.id === id && !t.critical) {
        const newState = !t.enabled;
        addToast(`${t.name} is now ${newState ? 'enabled' : 'disabled'}`, 'info');
        return { ...t, enabled: newState };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Email Types</h1>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filter === 'ALL' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            All
          </button>
          {Object.values(EmailCategory).map(cat => (
             <button 
             key={cat}
             onClick={() => setFilter(cat)}
             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filter === cat ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
           >
             {cat}
           </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTypes.map(type => (
          <Card key={type.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{type.name}</h3>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border dark:border-slate-700">{type.id}</span>
                  {type.critical && <Badge variant="warning">Critical</Badge>}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{type.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{type.category}</Badge>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {type.recipients.join(', ')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${type.enabled ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {type.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button 
                      onClick={() => toggleStatus(type.id)}
                      disabled={type.critical}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${type.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'} ${type.critical ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${type.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                 </div>
                 <Link 
                  to={`/email-types/${type.id}`}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                 >
                   <Edit2 className="w-5 h-5" />
                 </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 3. Email Detail / Editor
const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Need useEffect to update state if ID changes or on initial load with derived data
  const [data, setData] = useState<EmailType | undefined>();
  const [lang, setLang] = useState<Language>(Language.UA);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isDirty, setIsDirty] = useState(false);
  
  // State for editable fields
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // State for Test Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  // Variable Search
  const [varSearch, setVarSearch] = useState('');

  useEffect(() => {
    const found = INITIAL_EMAIL_TYPES.find(t => t.id === id);
    setData(found);
  }, [id]);

  // Sync state when data or lang changes
  useEffect(() => {
    if (data && data.templates && data.templates[lang]) {
      setSubject(data.templates[lang].subject);
      setBody(data.templates[lang].body);
      setIsDirty(false);
    }
  }, [data, lang]);

  // Warning before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleTextChange = (field: 'subject' | 'body', value: string) => {
    if (field === 'subject') setSubject(value);
    else setBody(value);
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!data) return;
    
    // Simulate API call
    const updatedData = { ...data };
    if (!updatedData.templates) updatedData.templates = {} as any;
    updatedData.templates[lang] = { subject, body };
    setData(updatedData);
    setIsDirty(false);
    addToast('Changes saved successfully', 'success');
  };

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = body;
      const newText = text.substring(0, start) + textToInsert + text.substring(end);
      setBody(newText);
      setIsDirty(true);
      // Restore focus
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
      }, 0);
    }
  };

  const handleVariableInsert = (variable: string) => {
    insertAtCursor(`{{${variable}}}`);
  };

  const handleToolbarAction = (action: 'bold' | 'italic' | 'link') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = body.substring(start, end);
    let insertion = '';

    if (action === 'bold') insertion = `**${selection || 'text'}**`;
    if (action === 'italic') insertion = `*${selection || 'text'}*`;
    if (action === 'link') insertion = `[${selection || 'text'}](url)`;

    const newText = body.substring(0, start) + insertion + body.substring(end);
    setBody(newText);
    setIsDirty(true);
    
    setTimeout(() => {
      textarea.focus();
      // Adjust cursor position to be inside the formatting if selection was empty
      if (!selection) {
        const offset = action === 'link' ? 1 : (action === 'bold' ? 2 : 1);
        textarea.setSelectionRange(start + offset, start + offset + 4); // Select 'text'
      } else {
         textarea.setSelectionRange(start + insertion.length, start + insertion.length);
      }
    }, 0);
  };

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/email-types');
      }
    } else {
      navigate('/email-types');
    }
  };

  const handleSendTest = () => {
    if (!testEmail) {
      addToast('Please enter an email address', 'error');
      return;
    }
    // Mock API Call
    setTimeout(() => {
      addToast(`Test email sent to ${testEmail}`, 'success');
      setShowTestModal(false);
      setTestEmail('');
    }, 500);
  };

  // Basic markdown-ish parser for preview
  const renderPreview = (text: string) => {
    if (!text) return null;
    // 1. Links: [text](url) -> <a href="url">text</a>
    // 2. Bold: **text** -> <strong>text</strong>
    // 3. Italic: *text* -> <em>text</em>
    // We do a simple split/map strategy for safety without using dangerouslySetInnerHTML recklessly
    // Note: This is a very naive parser for demonstration purposes.
    
    // Split by newlines first to handle paragraphs roughly
    return text.split('\n').map((line, lineIdx) => (
      <div key={lineIdx} className="min-h-[1.5em]">
        {line.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="italic">{part.slice(1, -1)}</em>;
          }
          if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
              return <a key={i} href={match[2]} className="text-blue-600 hover:underline pointer-events-none" onClick={e => e.preventDefault()}>{match[1]}</a>;
            }
          }
          return part;
        })}
      </div>
    ));
  };

  if (!data && id) return <div className="dark:text-white p-8">Loading...</div>;
  if (!data) return <div className="dark:text-white p-8">Type not found</div>;

  const filteredVariables = data?.availableVariables?.filter(v => 
    v.toLowerCase().includes(varSearch.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={handleBack} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-2 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to list
          </button>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{data.name}</h1>
             {isDirty && <Badge variant="warning">Unsaved</Badge>}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{data.description}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTestModal(true)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
          >
             Send Test Email
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm">
             Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="overflow-hidden min-h-[600px] flex flex-col">
            <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 flex items-center justify-between">
              <div className="flex gap-1">
                <button 
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === 'write' ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <FileText className="w-4 h-4" /> Write
                </button>
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === 'preview' ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
              </div>
              <div className="flex bg-slate-200 dark:bg-slate-700 rounded p-0.5">
                <button 
                  onClick={() => setLang(Language.UA)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${lang === Language.UA ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  🇺🇦 UA
                </button>
                <button 
                  onClick={() => setLang(Language.EN)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${lang === Language.EN ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  🇺🇸 EN
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {activeTab === 'write' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => handleTextChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Body</label>
                      {/* Rich Text Toolbar */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md p-1 gap-1">
                        <button onClick={() => handleToolbarAction('bold')} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200" title="Bold">
                          <Bold className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToolbarAction('italic')} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200" title="Italic">
                          <Italic className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToolbarAction('link')} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200" title="Link">
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      ref={textareaRef}
                      value={body}
                      onChange={(e) => handleTextChange('body', e.target.value)}
                      className="flex-1 w-full p-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-mono text-sm leading-relaxed"
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">Markdown supported</p>
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8 h-full">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">{subject}</h2>
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-sans text-sm space-y-2">
                    {renderPreview(body)}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Variables Card */}
           <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Available Variables</h3>
            <div className="mb-3 relative">
               <input 
                type="text" 
                placeholder="Search variables..."
                value={varSearch}
                onChange={(e) => setVarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
               />
               <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Click to insert into the body.</p>
            <div className="flex flex-wrap gap-2">
              {filteredVariables.length > 0 ? filteredVariables.map(variable => (
                <button
                  key={variable}
                  onClick={() => handleVariableInsert(variable)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-mono rounded border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-1 group"
                  title="Click to insert"
                >
                  <span>{`{{${variable}}}`}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )) : (
                 <span className="text-xs text-slate-400 italic">No variables match your search.</span>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">ID</span>
                <code className="text-xs bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{data.id}</code>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Trigger</span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{data.triggers}</span>
              </div>
              <div>
                 <span className="text-xs text-slate-500 dark:text-slate-400 block">Recipients</span>
                 <div className="flex flex-wrap gap-1 mt-1">
                   {data.recipients.map(r => (
                     <span key={r} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{r}</span>
                   ))}
                 </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Enabled</span>
                  <div className={`w-3 h-3 rounded-full ${data.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>
          </Card>

           <Card className="p-5 bg-indigo-50 border-indigo-100 dark:bg-slate-800 dark:border-indigo-900/50">
            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-400 mb-2 flex items-center gap-2">
              <span className="text-lg">✨</span> AI Assistant
            </h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3">
              Need help polishing the copy? Use our AI to improve tone or translate.
            </p>
            <button className="w-full py-1.5 bg-white dark:bg-slate-700 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors">
              Refine Content
            </button>
          </Card>
        </div>
      </div>

      {/* Test Email Modal */}
      <Modal isOpen={showTestModal} onClose={() => setShowTestModal(false)} title="Send Test Email">
         <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
               Enter an email address to send a preview of the <strong>{lang.toUpperCase()}</strong> template.
            </p>
            <div>
               <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Recipient Email</label>
               <input 
                  type="email" 
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
               />
            </div>
            <div className="flex justify-end gap-3 pt-2">
               <button 
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
               >
                  Cancel
               </button>
               <button 
                  onClick={handleSendTest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
               >
                  Send Test
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

// 4. Logs
const Logs = () => {
  const [logs] = useState<EmailLog[]>(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const filteredLogs = logs.filter(log => 
    log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.typeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Email Logs</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Type ID</th>
                <th className="px-6 py-3">Recipient</th>
                <th className="px-6 py-3">Sent At</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-900 dark:text-slate-100">
              {currentLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    {log.status === 'sent' && <Badge variant="success">Sent</Badge>}
                    {log.status === 'failed' && <Badge variant="danger">Failed</Badge>}
                    {log.status === 'queued' && <Badge variant="warning">Queued</Badge>}
                    {log.error && <div className="text-xs text-red-500 dark:text-red-400 mt-1 max-w-[200px] truncate" title={log.error}>{log.error}</div>}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{log.typeId}</td>
                  <td className="px-6 py-4">{log.recipient}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(log.sentAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs">Details</button>
                  </td>
                </tr>
              ))}
              {currentLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No logs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-medium">{filteredLogs.length}</span> results
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// 5. Subscribers
const Subscribers = () => {
  const [subscribers] = useState<Subscriber[]>(MOCK_SUBSCRIBERS);
  
  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Newsletter Subscribers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage marketing list and double opt-in status.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 text-white transition-colors">
            <Plus className="w-4 h-4" /> Add Manual
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Language</th>
                <th className="px-6 py-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-900 dark:text-slate-100">
              {subscribers.slice(0, 10).map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{sub.email}</td>
                  <td className="px-6 py-4">
                    {sub.status === 'confirmed' && <Badge variant="success">Confirmed</Badge>}
                    {sub.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                    {sub.status === 'unsubscribed' && <Badge variant="neutral">Unsubscribed</Badge>}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{sub.source}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 uppercase">{sub.language}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(sub.joinedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3 text-xs text-center text-slate-500 dark:text-slate-400">
            Showing recent 10 of {subscribers.length} subscribers
          </div>
        </div>
      </Card>
    </div>
  );
};

// 6. Settings
const SettingsPage = () => {
  const { addToast } = useToast();

  const handleSave = () => {
    addToast('Settings saved successfully', 'success');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Email Settings</h1>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Sender Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sender Name</label>
            <input type="text" defaultValue="AI Advisory Board" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sender Email</label>
            <input type="email" defaultValue="no-reply@aiadvisory.com" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reply-To Address</label>
            <input type="email" defaultValue="support@aiadvisory.com" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Rate Limiting & Safety</h2>
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Max Non-Critical Emails / Day</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Per user limit to prevent spam.</p>
              </div>
              <input type="number" defaultValue={3} className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
           </div>
           <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Send Window</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Only send non-critical emails during these hours.</p>
              </div>
              <div className="flex items-center gap-2">
                 <input type="time" defaultValue="08:00" className="px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 <span className="text-slate-400">-</span>
                 <input type="time" defaultValue="20:00" className="px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
           </div>
        </div>
      </Card>
      
      <div className="flex justify-end">
        <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Save Settings</button>
      </div>
    </div>
  );
};

// --- Layout & Router ---

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
    <span>{label}</span>
  </Link>
);

const Layout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transform transition-transform lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">A</div>
          <span className="font-bold text-slate-800 dark:text-white">AI Advisory</span>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Management</p>
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
            <SidebarLink to="/email-types" icon={Mail} label="Email Types" active={isActive('/email-types')} />
            <SidebarLink to="/logs" icon={History} label="Logs" active={isActive('/logs')} />
            <SidebarLink to="/subscribers" icon={Users} label="Subscribers" active={isActive('/subscribers')} />
          </div>
          
          <div>
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">System</p>
            <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">AD</div>
             <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">admin@company.com</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-4 sm:px-8 flex items-center justify-between transition-colors duration-200">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
             <button 
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Toggle Theme"
             >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
             <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <AlertCircle className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
             </button>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/email-types" element={<EmailTypes />} />
            <Route path="/email-types/:id" element={<EmailDetail />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/subscribers" element={<Subscribers />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <HashRouter>
          <Layout />
        </HashRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
