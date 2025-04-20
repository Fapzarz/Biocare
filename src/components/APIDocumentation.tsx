import { useState } from 'react';
import { 
  Code, 
  Copy, 
  CheckCircle, 
  Search,
  FileText,
  Key,
  Lock,
  Globe,
  ExternalLink,
  Clock,
  BookOpen,
  Sparkles,
  Zap,
  MessageCircle,
  Users,
  Heart
} from 'lucide-react';
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

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response: string;
  category: 'consultations' | 'auth' | 'users' | 'diseases';
}

const endpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/consultations',
    description: 'Mengambil daftar konsultasi',
    category: 'consultations',
    parameters: [
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter berdasarkan status (open/resolved)'
      },
      {
        name: 'category',
        type: 'string',
        required: false,
        description: 'Filter berdasarkan kategori'
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Jumlah maksimum data yang diambil'
      },
      {
        name: 'offset',
        type: 'number',
        required: false,
        description: 'Jumlah data yang dilewati untuk paginasi'
      }
    ],
    response: `{
  "consultations": [
    {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "author": {
        "id": "uuid",
        "name": "string",
        "is_doctor": boolean
      },
      "category": "string",
      "status": "open|resolved",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "tags": string[],
      "likes": number,
      "response_count": number
    }
  ],
  "total": number,
  "has_more": boolean
}`
  },
  {
    method: 'POST',
    path: '/api/consultations',
    description: 'Membuat konsultasi baru',
    category: 'consultations',
    parameters: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Judul konsultasi'
      },
      {
        name: 'content',
        type: 'string',
        required: true,
        description: 'Isi konsultasi'
      },
      {
        name: 'category',
        type: 'string',
        required: true,
        description: 'Kategori konsultasi'
      },
      {
        name: 'tags',
        type: 'string[]',
        required: false,
        description: 'Tag terkait konsultasi'
      }
    ],
    response: `{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "category": "string",
  "tags": string[],
  "created_at": "timestamp",
  "author": {
    "id": "uuid",
    "name": "string",
    "is_doctor": boolean
  }
}`
  },
  {
    method: 'GET',
    path: '/api/consultations/:id',
    description: 'Mengambil detail konsultasi',
    category: 'consultations',
    parameters: [
      {
        name: 'id',
        type: 'uuid',
        required: true,
        description: 'ID konsultasi'
      }
    ],
    response: `{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "author": {
    "id": "uuid",
    "name": "string",
    "is_doctor": boolean
  },
  "category": "string",
  "status": "open|resolved",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "tags": string[],
  "likes": number,
  "responses": [
    {
      "id": "uuid",
      "content": "string",
      "author": {
        "id": "uuid",
        "name": "string",
        "is_doctor": boolean
      },
      "is_solution": boolean,
      "created_at": "timestamp"
    }
  ]
}`
  },
  {
    method: 'POST',
    path: '/api/auth/signup',
    description: 'Mendaftarkan pengguna baru',
    category: 'auth',
    parameters: [
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Email pengguna'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        description: 'Password pengguna'
      },
      {
        name: 'full_name',
        type: 'string',
        required: true,
        description: 'Nama lengkap pengguna'
      }
    ],
    response: `{
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "created_at": "timestamp"
  },
  "session": {
    "access_token": "string",
    "token_type": "bearer",
    "expires_in": number
  }
}`
  },
  {
    method: 'POST',
    path: '/api/auth/signin',
    description: 'Login pengguna',
    category: 'auth',
    parameters: [
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Email pengguna'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        description: 'Password pengguna'
      }
    ],
    response: `{
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string"
  },
  "session": {
    "access_token": "string",
    "token_type": "bearer",
    "expires_in": number
  }
}`
  },
  {
    method: 'GET',
    path: '/api/users/me',
    description: 'Mengambil profil pengguna yang sedang login',
    category: 'users',
    response: `{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "is_doctor": boolean,
  "verification_status": "unverified|pending|verified",
  "specialization": "string|null",
  "reputation_score": number,
  "total_consultations": number,
  "total_solutions": number,
  "badges": [
    {
      "name": "string",
      "level": number,
      "awarded_at": "timestamp"
    }
  ]
}`
  },
  {
    method: 'PUT',
    path: '/api/users/me',
    description: 'Memperbarui profil pengguna',
    category: 'users',
    parameters: [
      {
        name: 'full_name',
        type: 'string',
        required: false,
        description: 'Nama lengkap pengguna'
      },
      {
        name: 'phone_number',
        type: 'string',
        required: false,
        description: 'Nomor telepon'
      },
      {
        name: 'bio',
        type: 'string',
        required: false,
        description: 'Biografi pengguna'
      }
    ],
    response: `{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "phone_number": "string|null",
  "bio": "string|null",
  "updated_at": "timestamp"
}`
  },
  {
    method: 'GET',
    path: '/api/diseases',
    description: 'Mengambil daftar penyakit',
    category: 'diseases',
    parameters: [
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Filter berdasarkan tipe (physical/mental)'
      },
      {
        name: 'search',
        type: 'string',
        required: false,
        description: 'Kata kunci pencarian'
      }
    ],
    response: `{
  "diseases": [
    {
      "id": "uuid",
      "name": "string",
      "type": "physical|mental",
      "medication": "string",
      "therapy": "string",
      "created_at": "timestamp"
    }
  ],
  "total": number
}`
  },
  {
    method: 'GET',
    path: '/api/diseases/:id',
    description: 'Mengambil detail penyakit',
    category: 'diseases',
    parameters: [
      {
        name: 'id',
        type: 'uuid',
        required: true,
        description: 'ID penyakit'
      }
    ],
    response: `{
  "id": "uuid",
  "name": "string",
  "type": "physical|mental",
  "medication": "string",
  "therapy": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}`
  }
];

const categories = [
  { id: 'consultations', name: 'Consultations', icon: MessageCircle },
  { id: 'auth', name: 'Authentication', icon: Key },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'diseases', name: 'Diseases', icon: Heart }
];

export function APIDocumentation() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false });
    }, 2000);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredEndpoints = endpoints.filter(endpoint => 
    selectedCategory ? endpoint.category === selectedCategory : true
  ).filter(endpoint =>
    searchQuery ? (
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true
  );

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
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-8 text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.1)_100%)]" />
          <div className="relative space-y-4">
            <Code className="h-12 w-12" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">API Documentation</h1>
              <p className="text-lg text-white/80">
                Dokumentasi lengkap untuk BioCare API
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="search"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: BookOpen, title: "Getting Started", desc: "Quick start guide" },
            { icon: Lock, title: "Authentication", desc: "Secure your requests" },
            { icon: Globe, title: "Base URL", desc: "API endpoints" }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Authentication Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Authentication
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              All API requests require authentication. Add the following header to your requests:
            </p>

            <div className="relative">
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
                <code>Authorization: Bearer YOUR_API_TOKEN</code>
              </div>
              <button
                onClick={() => handleCopy('Authorization: Bearer YOUR_API_TOKEN', 'auth')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {copiedStates['auth'] ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Endpoints */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Endpoints
            </h2>
            <div className="flex gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredEndpoints.map((endpoint, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    endpoint.method === 'GET'
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                      : endpoint.method === 'POST'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                      : endpoint.method === 'PUT'
                      ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-slate-900 dark:text-slate-100 font-mono">
                    {endpoint.path}
                  </code>
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {endpoint.description}
                </p>
              </div>

              {endpoint.parameters && (
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
                    Parameters
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            Required
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <tr key={paramIndex}>
                            <td className="px-4 py-2 text-sm font-mono text-slate-900 dark:text-slate-100">
                              {param.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                              {param.type}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {param.required ? (
                                <span className="text-rose-600 dark:text-rose-400">Yes</span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">No</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                              {param.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
                  Response
                </h3>
                <div className="relative">
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
                    <pre><code>{endpoint.response}</code></pre>
                  </div>
                  <button
                    onClick={() => handleCopy(endpoint.response, `response-${index}`)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedStates[`response-${index}`] ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SDK Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Official SDKs
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { name: 'JavaScript', version: 'v2.1.0', icon: Zap },
                { name: 'Python', version: 'v1.8.0', icon: FileText }
              ].map((sdk, i) => {
                const Icon = sdk.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {sdk.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {sdk.version}
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      <span>View Docs</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}