import React, { useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  db,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  increment
} from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Chrome, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
  Calculator
} from 'lucide-react';
import { cn } from '../lib/utils';

export const AuthScreen = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaTarget, setCaptchaTarget] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLegal, setShowLegal] = useState<boolean>(false);
  const [legalType, setLegalType] = useState<'terms' | 'privacy'>('terms');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists, if not create it
      const userRef = doc(db, 'users', user.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userRef);
      } catch (e) {
        import('../firebase').then(({ handleFirestoreError, OperationType }) => {
          handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
        });
        return;
      }
      
      if (!userDoc.exists()) {
        try {
          await setDoc(userRef, {
            name: user.displayName?.split(' ')[0] || 'User',
            surname: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            role: user.email === 'bartoantonio7@gmail.com' ? 'super_admin' : 'customer',
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp()
          });

          // Initialize/Increment stats on first social login too
          await updateDoc(doc(db, 'stats', 'global'), {
            totalUsers: increment(1)
          }).catch(() => {
            setDoc(doc(db, 'stats', 'global'), {
              totalUsers: 1,
              totalSimulations: 0,
              lastUpdate: serverTimestamp()
            });
          });
        } catch (e) {
          import('../firebase').then(({ handleFirestoreError, OperationType }) => {
            handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
          });
        }
      } else {
        // Just update last active
        try {
          await updateDoc(userRef, {
            lastActive: serverTimestamp()
          });
        } catch (e) {
          console.warn("Failed to update lastActive:", e);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login por Google ainda não foi ativado no Firebase Console. Por favor, ative-o em Authentication > Sign-in method.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Credenciais inválidas ou sessão expirada. Tente novamente.');
      } else {
        setError('Falha ao entrar com Google. Tente novamente.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return setError('Por favor, indique o seu e-mail para recuperar a palavra-passe.');
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setError(null);
      alert('E-mail de recuperação enviado com sucesso! Verifique a sua caixa de entrada.');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('O envio de e-mails está desativado. Ative o método "E-mail/Palavra-passe" no Firebase Console.');
      } else {
        setError('Falha ao enviar e-mail de recuperação. Verifique se o e-mail está correto.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!firstName || !surname) return setError('Por favor, indique o seu nome completo.');
      if (password !== confirmPassword) return setError('As palavras-passe não coincidem.');
      if (captchaValue !== captchaTarget) return setError('Código de verificação incorreto.');
    }

    try {
      setLoading(true);
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile
        await updateProfile(user, {
          displayName: `${firstName} ${surname}`
        });

        // Create user doc in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            name: firstName,
            surname: surname,
            email: email,
            role: email === 'bartoantonio7@gmail.com' ? 'super_admin' : 'customer',
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp()
          });

          // Increment user count
          await updateDoc(doc(db, 'stats', 'global'), {
            totalUsers: increment(1)
          }).catch(() => {
            // If stats doc doesn't exist, create it
            setDoc(doc(db, 'stats', 'global'), {
              totalUsers: 1,
              totalSimulations: 0,
              lastUpdate: serverTimestamp()
            });
          });
        } catch (e) {
          import('../firebase').then(({ handleFirestoreError, OperationType }) => {
            handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
          });
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou palavra-passe incorretos.');
      }
      else if (err.code === 'auth/email-already-in-use') setError('Este e-mail já está em uso.');
      else if (err.code === 'auth/invalid-email') setError('O formato do e-mail é inválido.');
      else if (err.code === 'auth/weak-password') setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      else if (err.code === 'auth/operation-not-allowed') {
        setError('O login por e-mail ainda não foi ativado no Firebase Console. Por favor, ative o método "E-mail/Palavra-passe" no separador Authentication.');
      }
      else setError('Ocorreu um erro técnico. Verifique os dados ou tente mais tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700",
      isAdminPortal ? "bg-black" : "bg-slate-950"
    )}>
      {/* Background Orbs */}
      {!isAdminPortal && (
        <>
          <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10">
          <div className={cn(
            "inline-flex items-center justify-center w-24 h-24 rounded-[32px] shadow-2xl mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 group",
            isAdminPortal ? "bg-white" : "bg-gradient-to-br from-primary to-primary/60 shadow-primary/30"
          )}>
             <Calculator className={cn(isAdminPortal ? "text-black" : "text-white", "group-hover:scale-110 transition-transform")} size={48} />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">KwanzaSalary</h1>
          <p className="text-slate-400 text-xs font-black tracking-[0.3em] uppercase">
            {isAdminPortal ? "Portal de Administração" : "The Gold Standard for Angola"}
          </p>
        </div>

        <div className={cn(
          "bg-white/5 backdrop-blur-3xl p-10 rounded-[48px] border shadow-2xl transition-all duration-500",
          isAdminPortal ? "border-white/20" : "border-white/10"
        )}>
          {!isAdminPortal ? (
            <div className="flex gap-4 p-1.5 bg-white/5 rounded-3xl mb-10">
              <button 
                onClick={() => setMode('login')}
                className={cn(
                  "flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                  mode === 'login' ? "bg-white text-slate-900 shadow-xl" : "text-white hover:bg-white/5"
                )}
              >
                Entrar
              </button>
              <button 
                onClick={() => setMode('register')}
                className={cn(
                  "flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                  mode === 'register' ? "bg-white text-slate-900 shadow-xl" : "text-white hover:bg-white/5"
                )}
              >
                Registar
              </button>
            </div>
          ) : (
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 mb-4">
                <ShieldCheck size={12} />
                Acesso Restrito
              </div>
              <h2 className="text-xl font-bold text-white">Login da Equipa</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Painel Administrativo v4.0</p>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {mode === 'register' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="relative group">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Nome"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
                <div className="relative group">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Sobrenome"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="Palavra-passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
              {mode === 'login' && !isAdminPortal && (
                <div className="flex justify-end pr-2">
                  <button 
                    type="button"
                    onClick={handleResetPassword}
                    className="text-[10px] text-primary hover:underline font-black uppercase tracking-widest"
                  >
                    Esqueceu a palavra-passe?
                  </button>
                </div>
              )}
              {mode === 'register' && (
                <div className="relative group animate-in fade-in slide-in-from-top-4 duration-500">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="password" 
                    placeholder="Repetir passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Verificação Humana</p>
                  <input 
                    type="text" 
                    placeholder="Código ao lado"
                    value={captchaValue}
                    onChange={(e) => setCaptchaValue(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-1 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 select-none flex items-center gap-2">
                   <ShieldCheck className="text-primary" size={16} />
                   <span className="font-mono text-xl font-black text-white italic tracking-[0.2em]">{captchaTarget}</span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs font-bold"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50",
                isAdminPortal 
                  ? "bg-white text-black hover:bg-slate-200" 
                  : "bg-primary text-white hover:bg-black shadow-primary/20"
              )}
            >
              {loading ? (
                <div className={cn("w-5 h-5 border-2 rounded-full animate-spin", isAdminPortal ? "border-black/30 border-t-black" : "border-white/30 border-t-white")} />
              ) : (
                <>
                  {isAdminPortal ? 'Autenticar Staff' : (mode === 'login' ? 'Entrar no Sistema' : 'Criar Conta Premium')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {!isAdminPortal ? (
            <>
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
                  <span className="bg-slate-950 px-6 text-slate-500 font-black">Ou via social</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-white/10 transition-all active:scale-[0.98]"
              >
                <Chrome size={20} className="text-red-400" />
                Acesso via Google
              </button>

              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="text-center text-[10px] text-slate-600 font-bold px-4 leading-relaxed uppercase tracking-widest">
                  Ao aceder, concorda com os <br />
                  <button onClick={() => { setLegalType('terms'); setShowLegal(true); }} className="text-primary hover:underline">Termos Legais</button> & <button onClick={() => { setLegalType('privacy'); setShowLegal(true); }} className="text-primary hover:underline">Privacidade</button>.
                </div>
                
                <button 
                  onClick={() => { setIsAdminPortal(true); setMode('login'); }}
                  className="text-[9px] font-black text-slate-700 hover:text-white uppercase tracking-[0.4em] transition-colors"
                >
                  [ ACESSO DE GESTÃO ]
                </button>
              </div>
            </>
          ) : (
            <div className="mt-10 text-center">
              <button 
                onClick={() => setIsAdminPortal(false)}
                className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
              >
                Voltar à Área Pública
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Legal Modal */}
      <AnimatePresence>
        {showLegal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[40px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {legalType === 'terms' ? 'Termos de Responsabilidade' : 'Política de Privacidade'}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowLegal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto text-slate-600 leading-relaxed space-y-6 text-sm">
                {legalType === 'terms' ? (
                  <>
                    <p className="font-bold text-slate-800">1. Natureza Informativa</p>
                    <p>Esta aplicação é uma ferramenta de simulação e tem fins puramente informativos. Os cálculos baseiam-se na Legislação Geral do Trabalho de Angola (LGT) e no Código do IRT em vigor à data da última atualização.</p>
                    
                    <p className="font-bold text-slate-800">2. Isenção de Responsabilidade</p>
                    <p>Não garantimos a precisão absoluta para todos os casos específicos ou interpretações jurídicas divergentes. O utilizador deve sempre consultar um profissional de RH, contabilista ou advogado especializado antes de tomar decisões financeiras ou contratuais.</p>

                    <p className="font-bold text-slate-800">3. Decisões do Utilizador</p>
                    <p>Qualquer utilização dos dados gerados por esta ferramenta é da inteira responsabilidade do utilizador. Não nos responsabilizamos por quaisquer perdas, danos ou litígios decorrentes do uso desta simulação.</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-800">1. Coleta de Dados</p>
                    <p>Coletamos o seu e-mail e nome apenas para fins de autenticação e personalização da sua experiência. Não compartilhamos os seus dados com terceiros.</p>
                    
                    <p className="font-bold text-slate-800">2. Segurança</p>
                    <p>Utilizamos serviços do Google Firebase para garantir que os seus dados sejam armazenados de forma segura e criptografada.</p>

                    <p className="font-bold text-slate-800">3. Dados de Cálculos</p>
                    <p>Os valores inseridos nas simulações não são associados pessoalmente de forma a identificar rendimentos individuais por terceiros. As simulações que guardar no seu histórico são privadas e acessíveis apenas por si.</p>
                  </>
                )}
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-white">
                <button 
                  onClick={() => setShowLegal(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl"
                >
                  Li e Compreendo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
