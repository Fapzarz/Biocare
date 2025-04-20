import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { DiseaseList } from './components/DiseaseList';
import { SearchHero } from './components/SearchHero';
import { ConsultationList } from './components/ConsultationList';
import { ConsultationDetail } from './components/ConsultationDetail';
import { ConsultationForm } from './components/ConsultationForm';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { ProfilePage } from './components/ProfilePage';
import { FAQ } from './components/FAQ';
import { APIDocumentation } from './components/APIDocumentation';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsAndConditions } from './components/TermsAndConditions';
import { ChangeLog } from './components/ChangeLog';
import { Roadmap } from './components/Roadmap';
import { SystemStatus } from './components/SystemStatus';
import { SupportDocumentation } from './components/SupportDocumentation';
import { Disease, User, Stats, Post, Comment } from './types';
import { auth } from './lib/auth';
import { supabase } from './lib/supabase';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SkeletonLoader } from './components/SkeletonLoader';

type View = 
  | 'landing' 
  | 'login' 
  | 'home' 
  | 'admin' 
  | 'doctor'
  | 'profile'
  | 'faq'
  | 'api'
  | 'privacy'
  | 'terms'
  | 'changelog'
  | 'roadmap'
  | 'status'
  | 'support'
  | 'search';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [previousView, setPreviousView] = useState<View | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const [stats, setStats] = useState<Stats>({
    totalAccess: 0,
    diseasesAdded: 0,
    diseasesDeleted: 0,
    searchesPerformed: 0,
    searchesSuccessful: 0,
    searchesFailed: 0,
    adminLogins: 0,
    userAccess: 0,
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        const session = await auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: '',
            phoneNumber: '',
            isAdmin: session.user.email === 'admin_Kj9#mP2$vL5@biocare.com',
            isDoctor: false,
            verified: false,
            password: ''
          });

          // Restore last view from localStorage
          const lastView = localStorage.getItem('currentView') as View;
          if (lastView) {
            setCurrentView(lastView);
          }
        }
      } catch (err) {
        setError('Failed to initialize app');
        console.error('Error initializing app:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    loadDiseases();
    loadPosts();
  }, []);

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  const loadDiseases = async () => {
    try {
      setIsLoadingDiseases(true);
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setDiseases(data);
    } catch (err) {
      setError('Error loading diseases');
      console.error('Error loading diseases:', err);
    } finally {
      setIsLoadingDiseases(false);
    }
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading posts:', error);
      return;
    }

    setPosts(data);
  };

  const loadComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('consultation_responses')
      .select('*')
      .eq('consultation_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    setComments(data);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
    setStats(prev => ({
      ...prev,
      searchesPerformed: prev.searchesPerformed + 1,
      searchesSuccessful: query ? prev.searchesSuccessful + 1 : prev.searchesSuccessful,
      searchesFailed: query && !diseases.some(d => 
        d.name.toLowerCase().includes(query.toLowerCase())
      ) ? prev.searchesFailed + 1 : prev.searchesFailed
    }));
  };

  const handleLogin = async (user: User) => {
    setUser(user);
    setShowLoginForm(false);
    setCurrentView(user.isAdmin ? 'admin' : user.isDoctor && user.verified ? 'doctor' : 'home');
    setStats(prev => ({
      ...prev,
      totalAccess: prev.totalAccess + 1,
      userAccess: prev.userAccess + 1,
      adminLogins: user.isAdmin ? prev.adminLogins + 1 : prev.adminLogins
    }));
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setSearchQuery('');
    setCurrentView('landing');
    localStorage.removeItem('currentView');
  };

  const handleAddDisease = async (disease: Disease) => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .insert([disease])
        .select()
        .single();

      if (error) throw error;
      
      setDiseases(prev => [...prev, data]);
      setStats(prev => ({
        ...prev,
        diseasesAdded: prev.diseasesAdded + 1
      }));

      return data;
    } catch (error) {
      console.error('Error adding disease:', error);
      throw error;
    }
  };

  const handleEditDisease = async (disease: Disease) => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .update({
          name: disease.name,
          type: disease.type,
          medication: disease.medication,
          therapy: disease.therapy
        })
        .eq('name', disease.name)
        .select()
        .single();

      if (error) throw error;
      
      setDiseases(prev => prev.map(d => d.name === disease.name ? data : d));

      return data;
    } catch (error) {
      console.error('Error updating disease:', error);
      throw error;
    }
  };

  const handleDeleteDisease = async (disease: Disease) => {
    try {
      const { error } = await supabase
        .from('diseases')
        .delete()
        .eq('name', disease.name);

      if (error) throw error;
      
      setDiseases(prev => prev.filter(d => d.name !== disease.name));
      setStats(prev => ({
        ...prev,
        diseasesDeleted: prev.diseasesDeleted + 1
      }));
    } catch (error) {
      console.error('Error deleting disease:', error);
      throw error;
    }
  };

  const handlePostClick = async (post: Post) => {
    setSelectedPost(post);
    await loadComments(post.id);
  };

  const handleCommentAdded = (comment: Comment) => {
    setComments(prev => [...prev, comment]);
  };

  const handleNavigate = (view: View) => {
    setPreviousView(currentView);
    setCurrentView(view);
  };

  const handleBack = () => {
    if (previousView) {
      setCurrentView(previousView);
      setPreviousView(null);
    } else {
      setCurrentView('home');
    }
  };

  const handleProfileClick = (userId: string) => {
    setSelectedProfileId(userId);
    setCurrentView('profile');
  };

  const filteredDiseases = diseases.filter(disease =>
    disease.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    if (showLoginForm) {
      return (
        <LoginForm 
          onLogin={handleLogin} 
          acceptedTerms={acceptedTerms}
          onAcceptTerms={() => setAcceptedTerms(true)}
        />
      );
    }
    return (
      <LandingPage 
        onExplore={() => setShowLoginForm(true)}
        onViewFAQ={() => setCurrentView('faq')}
        onViewPrivacy={() => setCurrentView('privacy')}
        onViewTerms={() => setCurrentView('terms')}
        onViewStatus={() => setCurrentView('status')}
      />
    );
  }

  // Show admin dashboard for admin users
  if (user.isAdmin && currentView === 'admin') {
    return (
      <AdminDashboard
        user={user}
        diseases={diseases}
        stats={stats}
        onAddDisease={handleAddDisease}
        onEditDisease={handleEditDisease}
        onDeleteDisease={handleDeleteDisease}
        onLogout={handleLogout}
        onBack={handleBack}
      />
    );
  }

  // Show doctor dashboard for verified doctors
  if (user.isDoctor && user.verified && currentView === 'doctor') {
    return (
      <DoctorDashboard
        user={user}
        onLogout={handleLogout}
        onBack={handleBack}
      />
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <ProfilePage 
          userId={selectedProfileId || user.id} 
          currentUserId={user.id} 
          onBack={handleBack}
        />;
      case 'faq':
        return (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <FAQ />
          </div>
        );
      case 'api':
        return (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <APIDocumentation />
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <PrivacyPolicy />
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <TermsAndConditions />
          </div>
        );
      case 'changelog':
        return (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <ChangeLog />
          </div>
        );
      case 'roadmap':
        return (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <Roadmap />
          </div>
        );
      case 'status':
        return (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <SystemStatus />
          </div>
        );
      case 'support':
        return (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <SupportDocumentation />
          </div>
        );
      case 'search':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Search Results
            </h2>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}
            {isLoadingDiseases ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonLoader key={i} type="card" />
                ))}
              </div>
            ) : (
              <DiseaseList diseases={filteredDiseases} />
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-12">
            <SearchHero onSearch={handleSearch} />
            
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Health Consultations
                </h2>
                <button
                  onClick={() => setShowConsultationForm(true)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  aria-label="Create new consultation"
                >
                  Ask a Question
                </button>
              </div>
              <ConsultationList 
                posts={posts}
                onPostClick={handlePostClick}
                currentUserId={user.id}
                onAuthorClick={handleProfileClick}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      user={user ? { 
        username: user.fullName, 
        isAdmin: user.isAdmin,
        isDoctor: user.isDoctor
      } : null} 
      onLogout={handleLogout} 
      onSearch={handleSearch}
      onProfileClick={() => handleProfileClick(user.id)}
      onNavigate={(view) => handleNavigate(view as View)}
    >
      {renderContent()}

      {selectedPost && (
        <ConsultationDetail
          post={selectedPost}
          comments={comments}
          currentUser={{
            id: user.id,
            fullName: user.fullName,
            isDoctor: user.isDoctor && user.verified
          }}
          onClose={() => setSelectedPost(null)}
          onCommentAdded={handleCommentAdded}
          onAuthorClick={handleProfileClick}
        />
      )}

      {showConsultationForm && (
        <ConsultationForm
          currentUser={{
            id: user.id,
            fullName: user.fullName,
            isDoctor: user.isDoctor && user.verified
          }}
          onSubmit={async (post) => {
            const { data, error } = await supabase
              .from('consultations')
              .insert([post])
              .select()
              .single();

            if (error) {
              console.error('Error creating consultation:', error);
              return;
            }

            setPosts(prev => [data, ...prev]);
            setShowConsultationForm(false);
          }}
          onCancel={() => setShowConsultationForm(false)}
        />
      )}
    </Layout>
  );
}

export default App;