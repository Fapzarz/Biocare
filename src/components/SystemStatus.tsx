import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Activity,
  Server,
  Database,
  Shield,
  RefreshCw,
  Zap,
  Clock,
  Cpu,
  Globe,
  BarChart2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface SystemComponent {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  icon: React.ElementType;
  description: string;
}

export function SystemStatus() {
  const [components, setComponents] = useState<SystemComponent[]>([
    {
      name: 'API Server',
      status: 'operational',
      latency: 120,
      icon: Server,
      description: 'Core API services and endpoints'
    },
    {
      name: 'Database',
      status: 'operational',
      latency: 45,
      icon: Database,
      description: 'Data storage and retrieval'
    },
    {
      name: 'Authentication',
      status: 'operational',
      icon: Shield,
      description: 'User authentication and authorization'
    },
    {
      name: 'Real-time Updates',
      status: 'operational',
      latency: 89,
      icon: Zap,
      description: 'Live data synchronization'
    }
  ]);

  const [lastChecked, setLastChecked] = useState(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [uptime, setUptime] = useState('99.9%');
  const [incidents, setIncidents] = useState([]);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      // Check Supabase latency
      const dbStart = performance.now();
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();
      const dbLatency = Math.round(performance.now() - dbStart);

      // Check auth service latency
      const authStart = performance.now();
      await supabase.auth.getSession();
      const authLatency = Math.round(performance.now() - authStart);

      // Check realtime service latency
      const realtimeStart = performance.now();
      const channel = supabase.channel('latency-test');
      await channel.subscribe();
      const realtimeLatency = Math.round(performance.now() - realtimeStart);
      await supabase.removeChannel(channel);

      // Update components with real latencies
      setComponents(prev => prev.map(component => {
        if (component.name === 'Database') {
          return { 
            ...component, 
            latency: dbLatency,
            status: error ? 'down' : dbLatency > 1000 ? 'degraded' : 'operational'
          };
        }
        if (component.name === 'Authentication') {
          return { 
            ...component, 
            latency: authLatency,
            status: authLatency > 1000 ? 'degraded' : 'operational'
          };
        }
        if (component.name === 'Real-time Updates') {
          return { 
            ...component, 
            latency: realtimeLatency,
            status: realtimeLatency > 1000 ? 'degraded' : 'operational'
          };
        }
        return component;
      }));

      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking system status:', error);
      setComponents(prev => prev.map(component => ({
        ...component,
        status: 'down'
      })));
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 dark:bg-green-900/50';
      case 'degraded':
        return 'bg-yellow-100 dark:bg-yellow-900/50';
      case 'down':
        return 'bg-red-100 dark:bg-red-900/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return CheckCircle;
      case 'degraded':
        return AlertTriangle;
      case 'down':
        return XCircle;
      default:
        return CheckCircle;
    }
  };

  const allOperational = components.every(c => c.status === 'operational');

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Hero Section */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 p-8 text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.1)_100%)]" />
          <div className="relative space-y-4">
            <Activity className="h-12 w-12" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Status Sistem</h1>
              <p className="text-lg text-white/80">
                {allOperational 
                  ? 'Semua sistem beroperasi normal'
                  : 'Beberapa sistem mengalami gangguan'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pembaruan terakhir: {lastChecked.toLocaleTimeString()}
              </div>
              <button
                onClick={checkStatus}
                disabled={isChecking}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: Globe, title: "Uptime", value: uptime, desc: "30 hari terakhir" },
            { icon: Cpu, title: "Rata-rata Latency", value: "124ms", desc: "Response time" },
            { icon: BarChart2, title: "Request/Detik", value: "1.2k", desc: "Peak load" }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-start gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Component Status */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Status Komponen
          </h2>
          <div className="grid gap-4">
            {components.map((component, index) => {
              const StatusIcon = getStatusIcon(component.status);
              const ComponentIcon = component.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg ${getStatusBg(component.status)} flex items-center justify-center`}>
                        <ComponentIcon className={`h-6 w-6 ${getStatusColor(component.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                          {component.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {component.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(component.status)}`} />
                        <span className={`text-sm font-medium ${getStatusColor(component.status)}`}>
                          {component.status === 'operational' ? 'Operasional' :
                           component.status === 'degraded' ? 'Terganggu' :
                           'Tidak Tersedia'}
                        </span>
                      </div>
                      {component.latency && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Latency: {component.latency}ms
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Incident History */}
        <motion.div 
          variants={itemVariants}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Riwayat Insiden
          </h2>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Tidak ada insiden dalam 30 hari terakhir
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}