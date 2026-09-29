import { useEffect, useState } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom'

import {
  BedDouble,
  Building2,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  Menu,
  ReceiptIndianRupee,
  Search,
  Users,
  X,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Home,
  Pencil,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react'

import {
  createPayment,
  createRoom,
  createTenant,
  updateTenant,
  updateRoom,
  getCurrentUnpaid,
  getPayments,
  getPendingDues,
  getRooms,
  getTenants
} from './api'

import type {
  RentPayment,
  Room,
  Tenant
} from './types'


const money = (value = 0) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`


const nav = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    to: '/tenants',
    label: 'Tenants',
    icon: Users
  },
  {
    to: '/rooms',
    label: 'Rooms',
    icon: BedDouble
  },
  {
    to: '/payments',
    label: 'Rent Payments',
    icon: ReceiptIndianRupee
  },
  {
    to: '/dues',
    label: 'Pending Dues',
    icon: Clock3
  },
  {
    to: '/unpaid',
    label: 'Current Unpaid',
    icon: AlertCircle
  }
]


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<ProtectedRoute />} />
    </Routes>
  )
}

function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem('renteasy_auth') === 'true'

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Layout />
}

/* =========================================================
   LOGIN / SIGN UP / FORGOT PASSWORD
   ========================================================= */

const AUTH_USERS_KEY = 'renteasy_users'
const AUTH_CURRENT_KEY = 'renteasy_user'
const AUTH_SESSION_KEY = 'renteasy_auth'

type AuthUser = {
  name: string
  email: string
  password: string
}

function getAuthUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAuthUsers(users: AuthUser[]) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
}

function Login() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const resetMessages = () => {
    setError('')
    setMessage('')
  }

  const switchMode = (nextMode: 'login' | 'signup' | 'forgot') => {
    setMode(nextMode)
    resetMessages()
    setName('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    const normalizedEmail = email.trim().toLowerCase()
    const user = getAuthUsers().find(
      item => item.email.toLowerCase() === normalizedEmail
    )

    if (!user || user.password !== password) {
      setError('Invalid email or password.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      localStorage.setItem(AUTH_SESSION_KEY, 'true')
      localStorage.setItem(AUTH_CURRENT_KEY, user.email)
      setLoading(false)
      navigate('/', { replace: true })
    }, 300)
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    const normalizedEmail = email.trim().toLowerCase()

    if (name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }

    if (!normalizedEmail) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const users = getAuthUsers()

    if (users.some(item => item.email.toLowerCase() === normalizedEmail)) {
      setError('An administrator account with this email already exists.')
      return
    }

    const newUser: AuthUser = {
      name: name.trim(),
      email: normalizedEmail,
      password
    }

    saveAuthUsers([...users, newUser])
    setEmail(normalizedEmail)
    setPassword('')
    setConfirmPassword('')
    setName('')
    setMessage('Administrator account created successfully. You can sign in now.')
    setMode('login')
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    const normalizedEmail = email.trim().toLowerCase()
    const users = getAuthUsers()
    const index = users.findIndex(
      item => item.email.toLowerCase() === normalizedEmail
    )

    if (index === -1) {
      setError('No administrator account was found with this email address.')
      return
    }

    if (password.length < 6) {
      setError('New password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    users[index] = {
      ...users[index],
      password
    }

    saveAuthUsers(users)
    setPassword('')
    setConfirmPassword('')
    setMessage('Password changed successfully. Please sign in with your new password.')
    setMode('login')
  }

  const title =
    mode === 'login'
      ? 'Welcome back'
      : mode === 'signup'
        ? 'Create administrator account'
        : 'Reset your password'

  const subtitle =
    mode === 'login'
      ? 'Sign in to access your RentEasy dashboard.'
      : mode === 'signup'
        ? 'Create an account for the RentEasy administrator panel.'
        : 'Enter your administrator email and choose a new password.'

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-2">
      <div className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/30">
              <Home size={25} />
            </div>
            <div>
              <div className="text-2xl font-bold">RentEasy</div>
              <div className="text-sm text-slate-400">PG & Hostel Manager</div>
            </div>
          </div>

          <div className="mt-24 max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Property Management
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight">
              Manage rooms, tenants and rent in one place.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              A simple full-stack dashboard for managing PG and hostel operations
              with a Spring Boot API and MySQL database.
            </p>
          </div>
        </div>

        <div className="text-sm text-slate-500">RentEasy • Full Stack Java Project</div>
      </div>

      <div className="flex min-h-screen items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Home size={27} />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">RentEasy</h1>
            <p className="mt-1 text-sm text-slate-500">PG & Hostel Manager</p>
          </div>

          <div className="rounded-3xl border bg-white p-7 shadow-xl shadow-slate-200/70 sm:p-9">
            <div className="mb-7">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <LockKeyhole size={23} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            </div>

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <AuthInput
                  label="Email address"
                  icon={<Mail size={18} />}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="admin@example.com"
                  required
                />

                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  setShow={setShowPassword}
                  placeholder="Enter your password"
                  required
                />

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && <AuthMessage type="error">{error}</AuthMessage>}
                {message && <AuthMessage type="success">{message}</AuthMessage>}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogIn size={18} />
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="text-center text-sm text-slate-500">
                  New administrator?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Create account
                  </button>
                </div>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-5">
                <AuthInput
                  label="Full name"
                  icon={<Users size={18} />}
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="Administrator name"
                  required
                />

                <AuthInput
                  label="Email address"
                  icon={<Mail size={18} />}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="admin@example.com"
                  required
                />

                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  setShow={setShowPassword}
                  placeholder="At least 6 characters"
                  required
                />

                <PasswordInput
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                  placeholder="Re-enter your password"
                  required
                />

                {error && <AuthMessage type="error">{error}</AuthMessage>}
                {message && <AuthMessage type="success">{message}</AuthMessage>}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Create administrator account
                </button>

                <div className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <AuthInput
                  label="Administrator email"
                  icon={<Mail size={18} />}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="admin@example.com"
                  required
                />

                <PasswordInput
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  setShow={setShowPassword}
                  placeholder="At least 6 characters"
                  required
                />

                <PasswordInput
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                  placeholder="Re-enter your new password"
                  required
                />

                {error && <AuthMessage type="error">{error}</AuthMessage>}
                {message && <AuthMessage type="success">{message}</AuthMessage>}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <LockKeyhole size={18} />
                  Change password
                </button>

                <div className="text-center text-sm text-slate-500">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure access to your RentEasy administration panel
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthInput({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  required
}: {
  label: string
  icon: React.ReactNode
  type: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
      </div>
    </div>
  )
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder,
  required
}: {
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  setShow: (value: boolean) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

function AuthMessage({
  type,
  children
}: {
  type: 'error' | 'success'
  children: React.ReactNode
}) {
  return (
    <div
      className={
        type === 'error'
          ? 'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
          : 'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
      }
    >
      {children}
    </div>
  )
}


/* =========================================================
   LAYOUT
   ========================================================= */

function Layout() {
  const [open, setOpen] = useState(false)

  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50">

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-white transition-transform lg:translate-x-0 ${
          open
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >

        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">

          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600">
              <Home size={21} />
            </div>

            <div>
              <div className="text-lg font-bold">
                RentEasy
              </div>

              <div className="text-xs text-slate-400">
                PG & Hostel Manager
              </div>
            </div>
          </Link>

          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>

        </div>


        <nav className="space-y-1 p-4">

          {nav.map(item => {

            const Icon = item.icon

            const active =
              location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}

        </nav>


        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">

          <div className="rounded-xl bg-white/5 p-4">

            <div className="text-sm font-semibold">
              RentEasy Admin
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Room & payment control panel
            </div>

          </div>

        </div>

      </aside>


      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}


      <main className="lg:pl-64">

        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-white/95 px-4 backdrop-blur md:px-8">

          <button
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>


          <div className="ml-auto flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <div className="text-sm font-semibold">
                Administrator
              </div>

              <div className="text-xs text-slate-500">
                RentEasy
              </div>

            </div>


            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
              A
            </div>

          </div>

        </header>


        <div className="p-4 md:p-8">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/tenants"
              element={<Tenants />}
            />

            <Route
              path="/rooms"
              element={<Rooms />}
            />

            <Route
              path="/payments"
              element={<Payments />}
            />

            <Route
              path="/dues"
              element={<Dues />}
            />

            <Route
              path="/unpaid"
              element={<Unpaid />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </div>

      </main>

    </div>
  )
}


/* =========================================================
   COMMON COMPONENTS
   ========================================================= */

function PageHeader({
  title,
  description,
  action
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {

  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

      <div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

      </div>

      {action}

    </div>
  )
}


function Stat({
  title,
  value,
  icon: Icon,
  note
}: {
  title: string
  value: string | number
  icon: any
  note: string
}) {

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>

        </div>


        <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>

      </div>


      <p className="mt-4 text-xs text-slate-500">
        {note}
      </p>

    </div>
  )
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {

  const [tenants, setTenants] =
    useState<Tenant[]>([])

  const [rooms, setRooms] =
    useState<Room[]>([])

  const [payments, setPayments] =
    useState<RentPayment[]>([])

  const [loading, setLoading] =
    useState(true)


  const load = async () => {

    setLoading(true)

    try {

      const [
        t,
        r,
        p
      ] = await Promise.all([
        getTenants(),
        getRooms(),
        getPayments()
      ])

      setTenants(t || [])
      setRooms(r || [])
      setPayments(p || [])

    } catch {

    } finally {

      setLoading(false)

    }
  }


  useEffect(() => {
    load()
  }, [])


  const occupied =
    rooms.filter(
      r => r.occupied
    ).length


  const collected =
    payments.reduce(
      (s, p) =>
        s + Number(p.amount || 0),
      0
    )


  return (
    <>

      <PageHeader
        title="Dashboard"
        description="Monitor tenants, rooms and monthly rent payments."
        action={
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </button>
        }
      />


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          title="Total Tenants"
          value={tenants.length}
          icon={Users}
          note="Registered tenant records"
        />

        <Stat
          title="Total Rooms"
          value={rooms.length}
          icon={Building2}
          note={`${occupied} currently occupied`}
        />

        <Stat
          title="Collected Rent"
          value={money(collected)}
          icon={CircleDollarSign}
          note="Loaded payment records"
        />

        <Stat
          title="Payments"
          value={payments.length}
          icon={ReceiptIndianRupee}
          note="Recorded rent payments"
        />

      </div>


      <div className="mt-6 grid gap-6 xl:grid-cols-2">

        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b p-5">

            <h2 className="font-bold">
              Quick Actions
            </h2>

            <p className="text-xs text-slate-500">
              Common RentEasy operations
            </p>

          </div>


          <div className="grid gap-3 p-5 sm:grid-cols-2">

            <Quick
              to="/tenants"
              icon={Users}
              title="Register Tenant"
            />

            <Quick
              to="/rooms"
              icon={BedDouble}
              title="Manage Rooms"
            />

            <Quick
              to="/payments"
              icon={ReceiptIndianRupee}
              title="Log Rent Payment"
            />

            <Quick
              to="/dues"
              icon={Clock3}
              title="View Pending Dues"
            />

          </div>

        </div>


        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b p-5">

            <h2 className="font-bold">
              System Status
            </h2>

            <p className="text-xs text-slate-500">
              Full-stack connection overview
            </p>

          </div>


          <div className="space-y-4 p-5">

            <StatusRow
              title="React frontend"
              detail="Vite development server"
            />

            <StatusRow
              title="Spring Boot API"
              detail="http://localhost:8081"
            />

            <StatusRow
              title="MySQL database"
              detail="Connected through Spring Data JPA"
            />

          </div>

        </div>

      </div>

    </>
  )
}


/* =========================================================
   QUICK ACTION
   ========================================================= */

function Quick({
  to,
  icon: Icon,
  title
}: {
  to: string
  icon: any
  title: string
}) {

  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border p-4 transition hover:border-blue-300 hover:shadow-sm"
    >

      <span className="flex items-center gap-3">

        <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Icon size={18} />
        </span>

        <span className="text-sm font-semibold">
          {title}
        </span>

      </span>


      <ChevronRight
        size={17}
        className="text-slate-400"
      />

    </Link>
  )
}


/* =========================================================
   STATUS
   ========================================================= */

function StatusRow({
  title,
  detail
}: {
  title: string
  detail: string
}) {

  return (
    <div className="flex items-center gap-3">

      <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={18} />
      </div>

      <div>

        <div className="text-sm font-semibold">
          {title}
        </div>

        <div className="text-xs text-slate-500">
          {detail}
        </div>

      </div>

    </div>
  )
}


/* =========================================================
   TENANTS
   ========================================================= */

function Tenants() {
  const [rows, setRows] = useState<Tenant[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [q, setQ] = useState('')
  const [show, setShow] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const emptyForm: Tenant = {
    name: '',
    phone: '',
    email: '',
    roomId: undefined,
    moveInDate: '',
    monthlyRent: 0,
    active: true
  }

  const [form, setForm] = useState<Tenant>(emptyForm)

  const load = async () => {
    try {
      const [tenantData, roomData] = await Promise.all([
        getTenants(),
        getRooms()
      ])

      setRows(tenantData || [])
      setRooms(roomData || [])
    } catch (error) {
      console.error('Could not load tenants:', error)
      alert('Could not load tenant data.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = rows.filter(t =>
    `${t.name} ${t.phone || ''} ${t.email || ''}`
      .toLowerCase()
      .includes(q.toLowerCase())
  )

  /* =========================
     CREATE
     ========================= */

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShow(true)
  }

  /* =========================
     EDIT
     ========================= */

  const openEdit = (tenant: Tenant) => {
    const id = tenant.id ?? tenant.tenantId

    if (!id) {
      alert('Tenant ID not found.')
      return
    }

    setEditingId(Number(id))

    setForm({
      ...tenant,
      roomId:
        tenant.roomId ??
        tenant.room?.roomId ??
        tenant.room?.id ??
        undefined,
      moveInDate: tenant.moveInDate || '',
      monthlyRent: Number(tenant.monthlyRent || 0),
      active: tenant.active !== false
    })

    setShow(true)
  }

  /* =========================
     CREATE / UPDATE
     ========================= */

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId !== null) {

        await updateTenant(editingId, {
          name: form.name,
          phone: form.phone,
          email: form.email,
          roomId: form.roomId,
          moveInDate: form.moveInDate,
          monthlyRent: Number(form.monthlyRent || 0),
          active: form.active !== false
        })

        alert('Tenant updated successfully.')

      } else {

        await createTenant({
          name: form.name,
          phone: form.phone,
          email: form.email,
          roomId: form.roomId,
          moveInDate: form.moveInDate,
          monthlyRent: Number(form.monthlyRent || 0)
        })

        alert('Tenant registered successfully.')
      }

      setShow(false)
      setEditingId(null)
      setForm(emptyForm)

      await load()

    } catch (error: any) {

      console.error('Tenant save error:', error)

      alert(
        error?.response?.data?.message ||
        (
          editingId !== null
            ? 'Could not update tenant. Check the backend.'
            : 'Could not create tenant. Check the backend.'
        )
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Tenants"
        description="Register tenants and assign them to available rooms."
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Register Tenant
          </button>
        }
      />

      {/* SEARCH */}

      <div className="mb-4 flex items-center gap-2 rounded-xl border bg-white px-3">

        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search tenant..."
          className="w-full bg-transparent py-3 text-sm outline-none"
        />

      </div>


      {/* TENANT TABLE */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <Table>

          <thead>

            <tr>

              <Th>Tenant</Th>

              <Th>Phone</Th>

              <Th>Room</Th>

              <Th>Monthly Rent</Th>

              <Th>Status</Th>

              <Th>Action</Th>

            </tr>

          </thead>


          <tbody>

            {filtered.map(t => (

              <tr
                key={t.id ?? t.tenantId}
                className="border-t hover:bg-slate-50"
              >

                {/* TENANT */}

                <Td>

                  <div className="font-semibold">
                    {t.name}
                  </div>

                  <div className="text-xs text-slate-500">
                    {t.email || '—'}
                  </div>

                </Td>


                {/* PHONE */}

                <Td>
                  {t.phone || '—'}
                </Td>


                {/* ROOM */}

                <Td>
                  {t.room?.roomNumber ||
                    t.roomId ||
                    'Not assigned'}
                </Td>


                {/* MONTHLY RENT */}

                <Td>
                  {money(t.monthlyRent)}
                </Td>


                {/* STATUS */}

                <Td>

                  <Badge
                    text={
                      t.active === false
                        ? 'Inactive'
                        : 'Active'
                    }
                    good={
                      t.active !== false
                    }
                  />

                </Td>


                {/* EDIT */}

                <Td>

                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                  >
                    Edit
                  </button>

                </Td>

              </tr>

            ))}

          </tbody>

        </Table>


        {!filtered.length && (
          <Empty text="No tenants found." />
        )}

      </div>


      {/* CREATE / EDIT MODAL */}

      {show && (

        <Modal
          title={
            editingId !== null
              ? 'Edit Tenant'
              : 'Register Tenant'
          }
          onClose={() => {
            setShow(false)
            setEditingId(null)
          }}
        >

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            {/* NAME */}

            <Field label="Full name">

              <input
                required
                value={form.name}
                onChange={e =>
                  setForm({
                    ...form,
                    name: e.target.value
                  })
                }
              />

            </Field>


            {/* PHONE + EMAIL */}

            <div className="grid gap-4 sm:grid-cols-2">

              <Field label="Phone">

                <input
                  required
                  value={form.phone}
                  onChange={e =>
                    setForm({
                      ...form,
                      phone: e.target.value
                    })
                  }
                />

              </Field>


              <Field label="Email">

                <input
                  type="email"
                  value={form.email}
                  onChange={e =>
                    setForm({
                      ...form,
                      email: e.target.value
                    })
                  }
                />

              </Field>

            </div>


            {/* ROOM + DATE */}

            <div className="grid gap-4 sm:grid-cols-2">

              <Field label="Room">

                <select
                  value={form.roomId ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      roomId: e.target.value
                        ? Number(e.target.value)
                        : undefined
                    })
                  }
                >

                  <option value="">
                    Not assigned
                  </option>

                  {rooms
                    .filter(r => {
                      const roomId =
                        r.id ?? r.roomId

                      const currentRoomId =
                        form.roomId

                      return (
                        r.occupied !== true ||
                        Number(roomId) ===
                          Number(currentRoomId)
                      )
                    })
                    .map(r => (

                      <option
                        key={
                          r.id ??
                          r.roomId
                        }
                        value={
                          r.id ??
                          r.roomId
                        }
                      >
                        {r.roomNumber} — {money(r.monthlyRent)}
                      </option>

                    ))}

                </select>

              </Field>


              <Field label="Move-in date">

                <input
                  type="date"
                  value={
                    form.moveInDate || ''
                  }
                  onChange={e =>
                    setForm({
                      ...form,
                      moveInDate:
                        e.target.value
                    })
                  }
                />

              </Field>

            </div>


            {/* MONTHLY RENT */}

            <Field label="Monthly rent (₹)">

              <input
                required
                type="number"
                min="0"
                value={
                  form.monthlyRent ?? 0
                }
                onChange={e =>
                  setForm({
                    ...form,
                    monthlyRent:
                      Number(e.target.value)
                  })
                }
              />

            </Field>


            {/* ACTIVE STATUS */}

            {editingId !== null && (

              <Field label="Status">

                <select
                  value={
                    form.active === false
                      ? 'false'
                      : 'true'
                  }
                  onChange={e =>
                    setForm({
                      ...form,
                      active:
                        e.target.value === 'true'
                    })
                  }
                >

                  <option value="true">
                    Active
                  </option>

                  <option value="false">
                    Inactive
                  </option>

                </select>

              </Field>

            )}


            {/* BUTTONS */}

            <div className="flex justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={() => {
                  setShow(false)
                  setEditingId(null)
                }}
                className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>


              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingId !== null
                  ? 'Update Tenant'
                  : 'Register Tenant'}
              </button>

            </div>

          </form>

        </Modal>

      )}

    </>
  )
}

/* =========================================================
   ROOMS - ADD + EDIT
   ========================================================= */

function Rooms() {

  const [rows, setRows] =
    useState<Room[]>([])

  const [show, setShow] =
    useState(false)

  const [editingRoom, setEditingRoom] =
    useState<Room | null>(null)


  const [form, setForm] =
    useState<Room>({
      roomNumber: '',
      type: 'Single',
      monthlyRent: 0
    })


  const load = async () => {

    try {

      const data =
        await getRooms()

      setRows(data || [])

    } catch (error) {

      console.error(
        'Could not load rooms:',
        error
      )

    }

  }


  useEffect(() => {
    load()
  }, [])


  /* =========================
     OPEN ADD ROOM
     ========================= */

  const openAddRoom = () => {

    setEditingRoom(null)

    setForm({
      roomNumber: '',
      type: 'Single',
      monthlyRent: 0
    })

    setShow(true)

  }


  /* =========================
     OPEN EDIT ROOM
     ========================= */

  const openEditRoom = (
    room: Room
  ) => {

    setEditingRoom(room)

    setForm({
      ...room,
      roomNumber:
        room.roomNumber || '',

      type:
        (room as any).roomType ||
        room.type ||
        'Single',

      monthlyRent:
        Number(
          room.monthlyRent || 0
        )
    })

    setShow(true)

  }


  /* =========================
     SAVE ROOM
     ========================= */

  const submit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault()


      if (
        !form.roomNumber.trim()
      ) {

        alert(
          'Please enter room number.'
        )

        return

      }


      if (
        Number(form.monthlyRent) < 0
      ) {

        alert(
          'Monthly rent cannot be negative.'
        )

        return

      }


      try {

        const payload = {

          roomNumber:
            form.roomNumber.trim(),

          roomType:
            form.type,

          monthlyRent:
            Number(
              form.monthlyRent
            )

        }


        /* =========================
           EDIT EXISTING ROOM
           ========================= */

        if (editingRoom) {

          const roomId =
            editingRoom.id ??
            editingRoom.roomId


          if (!roomId) {

            alert(
              'Room ID not found.'
            )

            return

          }


          await updateRoom(
            Number(roomId),
            payload as any
          )


          alert(
            'Room updated successfully!'
          )

        }


        /* =========================
           CREATE NEW ROOM
           ========================= */

        else {

          await createRoom(
            payload as any
          )


          alert(
            'Room created successfully!'
          )

        }


        setShow(false)

        setEditingRoom(null)

        setForm({
          roomNumber: '',
          type: 'Single',
          monthlyRent: 0
        })


        await load()

      } catch (error: any) {

        console.error(
          'Room save error:',
          error
        )

        console.error(
          'Backend response:',
          error?.response?.data
        )


        alert(
          error?.response?.data?.message ||
          (
            editingRoom
              ? 'Could not update room.'
              : 'Could not create room.'
          )
        )

      }

    }


  return (
    <>

      <PageHeader
        title="Rooms"
        description="Track room availability and assigned tenants."
        action={
          <button
            onClick={openAddRoom}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Room
          </button>
        }
      />


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {rows.map(room => {

          const roomId =
            room.id ??
            room.roomId

          const roomType =
            (room as any).roomType ||
            room.type ||
            'Standard'


          return (

            <div
              key={roomId}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">

                    <BedDouble
                      size={21}
                    />

                  </div>


                  <div>

                    <div className="font-bold">
                      Room {room.roomNumber}
                    </div>

                    <div className="text-xs text-slate-500">
                      {roomType}
                    </div>

                  </div>

                </div>


                <Badge
                  text={
                    room.occupied
                      ? 'Occupied'
                      : 'Available'
                  }
                  good={
                    !room.occupied
                  }
                />

              </div>


              <div className="mt-5 border-t pt-4 text-sm">

                <span className="text-slate-500">
                  Monthly rent
                </span>


                <div className="mt-1 text-xl font-bold">
                  {money(
                    room.monthlyRent
                  )}
                </div>

              </div>


              {/* =========================
                  EDIT BUTTON
                 ========================= */}

              <button
                onClick={() =>
                  openEditRoom(room)
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >

                <Pencil size={16} />

                Edit Room

              </button>

            </div>

          )

        })}

      </div>


      {!rows.length && (

        <div className="mt-4 rounded-2xl border bg-white p-10">

          <Empty
            text="No rooms found. Add your first room."
          />

        </div>

      )}


      {/* =================================================
          ADD / EDIT ROOM MODAL
         ================================================= */}

      {show && (

        <Modal
          title={
            editingRoom
              ? 'Edit Room'
              : 'Add Room'
          }
          onClose={() => {
            setShow(false)
            setEditingRoom(null)
          }}
        >

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            <Field label="Room number">

              <input
                required
                value={
                  form.roomNumber
                }
                onChange={e =>
                  setForm({
                    ...form,
                    roomNumber:
                      e.target.value
                  })
                }
              />

            </Field>


            <Field label="Room type">

              <select
                value={
                  form.type ||
                  'Single'
                }
                onChange={e =>
                  setForm({
                    ...form,
                    type:
                      e.target.value
                  })
                }
              >

                <option value="Single">
                  Single
                </option>

                <option value="Double">
                  Double
                </option>

                <option value="Triple">
                  Triple
                </option>

                <option value="Shared">
                  Shared
                </option>

              </select>

            </Field>


            <Field label="Monthly rent (₹)">

              <input
                required
                type="number"
                min="0"
                value={
                  form.monthlyRent
                }
                onChange={e =>
                  setForm({
                    ...form,
                    monthlyRent:
                      Number(
                        e.target.value
                      )
                  })
                }
              />

            </Field>


            <ModalActions
              onClose={() => {
                setShow(false)
                setEditingRoom(null)
              }}
            />

          </form>

        </Modal>

      )}

    </>
  )
}


/* =========================================================
   PAYMENTS
   ========================================================= */

function Payments() {

  const [rows, setRows] =
    useState<RentPayment[]>([])

  const [tenants, setTenants] =
    useState<Tenant[]>([])

  const [show, setShow] =
    useState(false)


  const [form, setForm] =
    useState<RentPayment>({
      tenantId: 0,
      month:
        new Date()
          .toISOString()
          .slice(0, 7),
      amount: 0,
      paymentDate:
        new Date()
          .toISOString()
          .slice(0, 10),
      status: 'PAID'
    })


  const load = async () => {

    try {

      setRows(
        await getPayments()
      )

      setTenants(
        await getTenants()
      )

    } catch {}

  }


  useEffect(() => {
    load()
  }, [])


  const submit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault()

      try {

        await createPayment(form)

        setShow(false)

        load()

      } catch {

        alert(
          'Could not record payment. Check the backend endpoint.'
        )

      }

    }


  return (
    <>

      <PageHeader
        title="Rent Payments"
        description="Record monthly rent payments and keep a clear payment history."
        action={
          <button
            onClick={() =>
              setShow(true)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Log Payment
          </button>
        }
      />


      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <Table>

          <thead>

            <tr>

              <Th>Tenant</Th>
              <Th>Month</Th>
              <Th>Amount</Th>
              <Th>Payment Date</Th>
              <Th>Status</Th>

            </tr>

          </thead>


          <tbody>

            {rows.map(p => (

              <tr
                key={
                  p.id ??
                  p.paymentId
                }
                className="border-t"
              >

                <Td className="font-semibold">

                  {p.tenantName ||
                    tenants.find(
                      t =>
                        (
                          t.id ??
                          t.tenantId
                        ) ===
                        p.tenantId
                    )?.name ||
                    `Tenant #${p.tenantId}`}

                </Td>


                <Td>
                  {p.month}
                </Td>


                <Td>
                  {money(p.amount)}
                </Td>


                <Td>
                  {p.paymentDate}
                </Td>


                <Td>

                  <Badge
                    text={
                      p.status ||
                      'PAID'
                    }
                    good={
                      p.status !==
                      'PENDING'
                    }
                  />

                </Td>

              </tr>

            ))}

          </tbody>

        </Table>


        {!rows.length && (
          <Empty
            text="No rent payments recorded yet."
          />
        )}

      </div>


      {show && (

        <Modal
          title="Log Rent Payment"
          onClose={() =>
            setShow(false)
          }
        >

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            <Field label="Tenant">

              <select
                required
                value={
                  form.tenantId
                }
                onChange={e =>
                  setForm({
                    ...form,
                    tenantId:
                      Number(
                        e.target.value
                      )
                  })
                }
              >

                <option value={0}>
                  Select tenant
                </option>

                {tenants.map(t => (

                  <option
                    key={
                      t.id ??
                      t.tenantId
                    }
                    value={
                      t.id ??
                      t.tenantId
                    }
                  >
                    {t.name}
                  </option>

                ))}

              </select>

            </Field>


            <div className="grid gap-4 sm:grid-cols-2">

              <Field label="Month">

                <input
                  required
                  type="month"
                  value={
                    form.month
                  }
                  onChange={e =>
                    setForm({
                      ...form,
                      month:
                        e.target.value
                    })
                  }
                />

              </Field>


              <Field label="Amount (₹)">

                <input
                  required
                  type="number"
                  min="0"
                  value={
                    form.amount
                  }
                  onChange={e =>
                    setForm({
                      ...form,
                      amount:
                        Number(
                          e.target.value
                        )
                    })
                  }
                />

              </Field>

            </div>


            <Field label="Payment date">

              <input
                required
                type="date"
                value={
                  form.paymentDate
                }
                onChange={e =>
                  setForm({
                    ...form,
                    paymentDate:
                      e.target.value
                  })
                }
              />

            </Field>


            <Field label="Notes">

              <textarea
                rows={3}
                value={
                  form.notes || ''
                }
                onChange={e =>
                  setForm({
                    ...form,
                    notes:
                      e.target.value
                  })
                }
              />

            </Field>


            <ModalActions
              onClose={() =>
                setShow(false)
              }
            />

          </form>

        </Modal>

      )}

    </>
  )
}


/* =========================================================
   PENDING DUES
   ========================================================= */

function Dues() {

  const [rows, setRows] =
    useState<Tenant[]>([])

  const [loading, setLoading] =
    useState(true)


  const load = async () => {

    setLoading(true)

    try {

      setRows(
        await getPendingDues()
      )

    } catch {

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {
    load()
  }, [])


  return (
    <>

      <PageHeader
        title="Pending Dues"
        description="View tenants with outstanding rent."
        action={
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold"
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh

          </button>
        }
      />


      <TenantDueTable
        rows={rows}
      />

    </>
  )
}


/* =========================================================
   CURRENT UNPAID
   ========================================================= */

function Unpaid() {

  const [rows, setRows] =
    useState<Tenant[]>([])


  const load = async () => {

    try {

      setRows(
        await getCurrentUnpaid()
      )

    } catch {}

  }


  useEffect(() => {
    load()
  }, [])


  return (
    <>

      <PageHeader
        title="Current Month Unpaid"
        description="Tenants who have not paid for the current month."
        action={
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold"
          >

            <RefreshCw
              size={16}
            />

            Refresh

          </button>
        }
      />


      <TenantDueTable
        rows={rows}
      />

    </>
  )
}


/* =========================================================
   TENANT DUE TABLE
   ========================================================= */

function TenantDueTable({
  rows
}: {
  rows: Tenant[]
}) {

  return (

    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      <Table>

        <thead>

          <tr>

            <Th>Tenant</Th>
            <Th>Room</Th>
            <Th>Monthly Rent</Th>
            <Th>Move-in Date</Th>
            <Th>Status</Th>

          </tr>

        </thead>


        <tbody>

          {rows.map(t => (

            <tr
              key={
                t.id ??
                t.tenantId
              }
              className="border-t"
            >

              <Td className="font-semibold">
                {t.name}
              </Td>

              <Td>
                {t.room?.roomNumber ||
                  t.roomId ||
                  '—'}
              </Td>

              <Td>
                {money(
                  t.monthlyRent
                )}
              </Td>

              <Td>
                {t.moveInDate ||
                  '—'}
              </Td>

              <Td>

                <span className="font-semibold text-rose-600">
                  Payment due
                </span>

              </Td>

            </tr>

          ))}

        </tbody>

      </Table>


      {!rows.length && (
        <Empty
          text="No pending dues found."
        />
      )}

    </div>

  )
}


/* =========================================================
   TABLE
   ========================================================= */

function Table({
  children
}: {
  children: React.ReactNode
}) {

  return (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[650px] text-left text-sm">

        {children}

      </table>

    </div>
  )
}


function Th({
  children
}: {
  children: React.ReactNode
}) {

  return (
    <th className="bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  )
}


function Td({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {

  return (
    <td
      className={`px-5 py-4 text-slate-700 ${className}`}
    >
      {children}
    </td>
  )
}


/* =========================================================
   BADGE
   ========================================================= */

function Badge({
  text,
  good
}: {
  text: string
  good: boolean
}) {

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        good
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-rose-50 text-rose-700'
      }`}
    >
      {text}
    </span>
  )
}


/* =========================================================
   EMPTY
   ========================================================= */

function Empty({
  text
}: {
  text: string
}) {

  return (
    <div className="p-10 text-center text-sm text-slate-500">
      {text}
    </div>
  )
}


/* =========================================================
   FIELD
   ========================================================= */

function Field({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {

  return (
    <label className="block">

      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </span>


      <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:focus:border-blue-500 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:outline-none [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:px-3 [&_textarea]:py-2.5">

        {children}

      </div>

    </label>
  )
}


/* =========================================================
   MODAL
   ========================================================= */

function Modal({
  title,
  onClose,
  children
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">

      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="font-bold">
            {title}
          </h2>


          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={18} />
          </button>

        </div>


        <div className="p-6">

          {children}

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   MODAL ACTIONS
   ========================================================= */

function ModalActions({
  onClose
}: {
  onClose: () => void
}) {

  return (
    <div className="flex justify-end gap-3 border-t pt-4">

      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
      >
        Cancel
      </button>


      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Save
      </button>

    </div>
  )
}