/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut,
  Clock,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { Button, Card, Input } from './components/ui';
import { Subject, StudyTask, Screen, User } from './types';
import { generateStudyPlan } from './lib/planner';

// Initial dummy data for demo
const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'Advanced Calculus', deadline: '2026-06-15', difficulty: 'hard', color: 'indigo' },
  { id: '2', name: 'Molecular Biology', deadline: '2026-06-20', difficulty: 'medium', color: 'purple' },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(false);

  // Persistence (localStorage)
  useEffect(() => {
    const savedSubjects = localStorage.getItem('subjects');
    const savedTasks = localStorage.getItem('tasks');
    const savedUser = localStorage.getItem('user');

    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedUser) {
        setUser(JSON.parse(savedUser));
        setScreen('dashboard');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [subjects, tasks, user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setUser({ id: '1', name: 'John Doe', email: 'john@example.com' });
        setScreen('welcome');
        setLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    setUser(null);
    setScreen('auth');
  };

  const addSubject = (newSubject: Subject) => {
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const triggerGeneration = () => {
    setLoading(true);
    setTimeout(() => {
        const newTasks = generateStudyPlan(subjects);
        setTasks(newTasks);
        setScreen('dashboard');
        setLoading(false);
    }, 2000);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  // UI Components for Screens
  const ScreenWrapper = ({ children, key }: { children: React.ReactNode, key?: string }) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sidebar for desktop */}
      {user && (
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen overflow-hidden">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold text-xl tracking-tight text-gray-900">SmartStudy</span>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={screen === 'dashboard'} 
              onClick={() => setScreen('dashboard')} 
            />
            <NavItem 
              icon={<Calendar size={20} />} 
              label="Subjects" 
              active={screen === 'input'} 
              onClick={() => setScreen('input')} 
            />
            <NavItem 
              icon={<BarChart3 size={20} />} 
              label="Progress Tracker" 
              active={screen === 'progress'} 
              onClick={() => setScreen('progress')} 
            />
             <NavItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              active={false} 
              onClick={() => {}} 
            />
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 group transition-all">
                <div className="w-10 h-10 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-indigo-700 font-bold uppercase overflow-hidden">
                    {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">Computer Science</p>
                </div>
                <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                    <LogOut size={16} />
                </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-grow bg-[#F9FAFB] flex flex-col min-h-screen">
        <AnimatePresence mode="wait">
          {screen === 'auth' && (
            <ScreenWrapper key="auth">
              <AuthScreen onLogin={handleLogin} loading={loading} />
            </ScreenWrapper>
          )}

          {screen === 'welcome' && (
            <ScreenWrapper key="welcome">
              <WelcomeScreen onNext={() => setScreen('input')} user={user} />
            </ScreenWrapper>
          )}

          {screen === 'input' && (
            <ScreenWrapper key="input">
              <InputScreen 
                subjects={subjects} 
                onAdd={addSubject} 
                onRemove={removeSubject}
                onGenerate={triggerGeneration}
                loading={loading}
              />
            </ScreenWrapper>
          )}

          {screen === 'dashboard' && (
            <ScreenWrapper key="dashboard">
              <DashboardScreen tasks={tasks} onToggle={toggleTask} />
            </ScreenWrapper>
          )}

          {screen === 'progress' && (
            <ScreenWrapper key="progress">
              <ProgressScreen tasks={tasks} subjects={subjects} />
            </ScreenWrapper>
          )}
        </AnimatePresence>

        {/* Bottom Nav for Mobile */}
        {user && screen !== 'welcome' && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 z-50">
            <MobileNavItem 
              icon={<LayoutDashboard size={20} />} 
              active={screen === 'dashboard'} 
              onClick={() => setScreen('dashboard')} 
            />
            <MobileNavItem 
              icon={<Calendar size={20} />} 
              active={screen === 'input'} 
              onClick={() => setScreen('input')} 
            />
            <MobileNavItem 
              icon={<BarChart3 size={20} />} 
              active={screen === 'progress'} 
              onClick={() => setScreen('progress')} 
            />
          </nav>
        )}
      </main>
    </div>
  );
}

// Side Components
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-xl transition-all ${
                active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'
            }`}
        >
            {icon}
        </button>
    );
}

// Authentication Screen
function AuthScreen({ onLogin, loading }: { onLogin: (e: React.FormEvent) => void, loading: boolean }) {
    return (
        <div className="flex-grow flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-4">
                        <GraduationCap className="text-indigo-600 h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500">Sign in to SmartStudy to manage your schedule</p>
                </div>

                <form onSubmit={onLogin} className="flex flex-col gap-4">
                    <Input label="Email address" placeholder="name@college.edu" required type="email" />
                    <Input label="Password" placeholder="••••••••" required type="password" />
                    
                    <Button type="submit" loading={loading} className="w-full mt-2">
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 text-center border-t border-gray-50 pt-6">
                    <p className="text-sm text-gray-500">
                        Don't have an account? <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Create one</span>
                    </p>
                </div>
            </Card>
        </div>
    );
}

// Welcome/Onboarding Screen
function WelcomeScreen({ onNext, user }: { onNext: () => void, user: User | null }) {
    return (
        <div className="flex-grow flex items-center justify-center p-6 bg-indigo-600">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg text-center text-white"
            >
                <div className="inline-flex p-4 bg-white/20 rounded-3xl mb-8 backdrop-blur-md">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-4xl font-bold mb-4">Hey {user?.name.split(' ')[0]}!</h2>
                <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
                    Success in studies isn't about working harder, but working smarter. Let's build your perfect study schedule tailored to your deadlines.
                </p>
                <Button 
                    variant="secondary" 
                    size="lg" 
                    onClick={onNext}
                    className="w-full bg-white text-indigo-600 hover:bg-gray-50 font-bold"
                >
                    Let's Get Started <ChevronRight className="ml-2" />
                </Button>
            </motion.div>
        </div>
    );
}

// Input Screen
function InputScreen({ subjects, onAdd, onRemove, onGenerate, loading }: { 
    subjects: Subject[], 
    onAdd: (s: Subject) => void, 
    onRemove: (id: string) => void,
    onGenerate: () => void,
    loading: boolean
}) {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [diff, setDiff] = useState<'easy'|'medium'|'hard'>('medium');

    const handleAdd = () => {
        if (!name || !date) return;
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            name,
            deadline: date,
            difficulty: diff,
            color: ['indigo', 'purple', 'emerald', 'amber'][Math.floor(Math.random() * 4)],
        });
        setName('');
        setDate('');
    };

    return (
        <div className="max-w-4xl mx-auto w-full p-6 md:p-10 space-y-10 pb-24">
            <div>
                <h2 className="text-3xl font-bold mb-2">Build Your Subject List</h2>
                <p className="text-gray-500">What are you studying this semester?</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 h-fit">
                    <h3 className="text-lg font-bold mb-4">Add Subject</h3>
                    <div className="space-y-4">
                        <Input 
                            label="Subject Name" 
                            placeholder="e.g. Physics II" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input 
                            label="Deadline" 
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Difficulty</label>
                            <div className="flex gap-2">
                                {(['easy', 'medium', 'hard'] as const).map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDiff(d)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg border capitalize transition-all ${
                                            diff === d 
                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleAdd}>
                            Add to List
                        </Button>
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold">Your Subjects ({subjects.length})</h3>
                    {subjects.length === 0 ? (
                        <div className="p-10 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                            <BookOpen size={40} className="mb-4 opacity-50" />
                            <p>No subjects added yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {subjects.map((s) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={s.id} 
                                    className="p-4 bg-white rounded-xl border border-gray-100 flex justify-between items-center group shadow-sm hover:shadow-md transition-all"
                                >
                                    <div>
                                        <p className="font-bold text-gray-900">{s.name}</p>
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={12} /> {s.deadline}
                                            </span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-tighter">
                                                {s.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onRemove(s.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {subjects.length > 0 && (
                        <div className="pt-6">
                            <Button 
                                size="lg" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold" 
                                loading={loading}
                                onClick={onGenerate}
                            >
                                Generate Study Plan
                            </Button>
                            <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                                Our algorithm will optimize your study hours until the deadlines.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Dashboard Screen
function DashboardScreen({ tasks, onToggle }: { tasks: StudyTask[], onToggle: (id: string) => void }) {
    const tasksByDate = useMemo(() => {
        const groups: Record<string, StudyTask[]> = {};
        tasks.forEach(t => {
            if (!groups[t.date]) groups[t.date] = [];
            groups[t.date].push(t);
        });
        return groups;
    }, [tasks]);

    const dates = Object.keys(tasksByDate).sort();

    return (
        <div className="max-w-5xl mx-auto w-full p-6 md:p-10 space-y-10 pb-24">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-1">Your Daily Plan</h2>
                    <p className="text-gray-500">Pick up where you left off</p>
                </div>
                <div className="hidden sm:flex p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold text-sm">List View</button>
                    <button className="px-4 py-2 text-gray-500 rounded-lg font-semibold text-sm">Calendar</button>
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center p-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Calendar size={64} className="mx-auto text-indigo-200 mb-6" />
                    <h3 className="text-xl font-bold">No tasks generated yet</h3>
                    <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Go to the subjects screen and trigger the plan generation to see your schedule.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {dates.slice(0, 7).map((date) => (
                        <div key={date}>
                            <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <div className="flex-grow h-px bg-gray-100" />
                                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-50">
                                    {tasksByDate[date].length} Sessions
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasksByDate[date].map((task) => (
                                    <TaskCard key={task.id} task={task} onToggle={() => onToggle(task.id)} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function TaskCard({ task, onToggle, key }: { task: StudyTask, onToggle: () => void, key?: string }) {
    return (
        <Card key={key} className={`p-4 transition-all ${task.isCompleted ? 'bg-gray-50 border-transparent shadow-none grayscale opacity-60' : 'hover:border-indigo-200 hover:shadow-md'}`}>
            <div className="flex items-start gap-4">
                <button 
                    onClick={onToggle}
                    className={`mt-1 h-6 w-6 rounded border-2 flex items-center justify-center transition-all ${
                        task.isCompleted 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-gray-200 hover:border-indigo-400 text-transparent'
                    }`}
                >
                    <CheckCircle2 size={16} />
                </button>
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <p className={`font-medium transition-all ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {task.subjectName}
                        </p>
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                            <Clock size={10} /> {task.duration}m
                        </span>
                    </div>
                    <p className={`text-xs ${task.isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.title}
                    </p>
                </div>
            </div>
        </Card>
    );
}

// Progress Screen
function ProgressScreen({ tasks, subjects }: { tasks: StudyTask[], subjects: Subject[] }) {
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.isCompleted).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const bySubject = subjects.map(s => {
            const subjectTasks = tasks.filter(t => t.subjectId === s.id);
            const subTotal = subjectTasks.length;
            const subCompleted = subjectTasks.filter(t => t.isCompleted).length;
            const subPercent = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;
            return { ...s, percent: subPercent, completed: subCompleted, total: subTotal };
        });

        return { total, completed, percent, bySubject };
    }, [tasks, subjects]);

    return (
        <div className="max-w-4xl mx-auto w-full p-6 md:p-10 space-y-10 pb-24">
            <div>
                <h2 className="text-3xl font-bold mb-2">Learning Progress</h2>
                <p className="text-gray-500">Track your journey to mastery</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <h3 className="text-lg font-bold mb-6 text-gray-900">Overall Completion</h3>
                    <div className="flex flex-col items-center">
                        <div className="relative h-48 w-48 flex items-center justify-center mb-6">
                            <svg className="h-full w-full rotate-[-90deg]">
                                <circle 
                                    cx="96" cy="96" r="80" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="12" 
                                    className="text-gray-100"
                                />
                                <motion.circle 
                                    cx="96" cy="96" r="80" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="12" 
                                    strokeDasharray={2 * Math.PI * 80}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - stats.percent / 100) }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="text-indigo-600 rounded-full"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-gray-900">{stats.percent}%</span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Weekly Target</span>
                            </div>
                        </div>
                        <p className="text-center text-gray-500 max-w-xs">
                            You've completed <span className="font-bold text-gray-900">{stats.completed}</span> out of <span className="font-bold text-gray-900">{stats.total}</span> total sessions. Keep the momentum going!
                        </p>
                    </div>
                </Card>

                <div className="md:col-span-1 flex flex-col gap-6">
                   <Card className="bg-indigo-900 text-white border-transparent">
                        <h4 className="font-bold mb-1 opacity-80 uppercase text-xs tracking-widest">Daily Tip</h4>
                        <div className="flex items-end gap-2 my-2">
                            <p className="text-lg font-medium leading-tight">Try the Pomodoro technique: 25 mins focus, 5 mins break.</p>
                        </div>
                        <button className="text-xs font-bold uppercase tracking-wider text-indigo-200 hover:text-white mt-4">Learn More &rarr;</button>
                   </Card>
                   <Card>
                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Milestones</h4>
                        <div className="space-y-4">
                            <MilestoneItem label="First Week" completed={true} />
                            <MilestoneItem label="Perfect Day" completed={true} />
                            <MilestoneItem label="Subject Master" completed={false} />
                        </div>
                   </Card>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Subject Masteries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.bySubject.map(s => (
                        <Card key={s.id} className="p-5 border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-gray-900">{s.name}</span>
                                <span className="text-sm font-bold text-indigo-600">{s.percent}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${s.percent}%` }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-indigo-600 rounded-full"
                                />
                            </div>
                             <div className="mt-3 flex justify-between items-center">
                                <div className="flex gap-1">
                                    <div className={`w-2 h-2 rounded-full ${s.percent > 70 ? 'bg-indigo-500' : s.percent > 30 ? 'bg-amber-400' : 'bg-red-400'}`} />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{s.completed} / {s.total} Tasks</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MilestoneItem({ label, completed }: { label: string, completed: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`p-1 rounded-full ${completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                <CheckCircle2 size={14} />
            </div>
            <span className={`text-sm font-semibold ${completed ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
        </div>
    );
}
