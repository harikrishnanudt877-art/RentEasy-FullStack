import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation
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
  Home
} from 'lucide-react'

import {
  createPayment,
  createRoom,
  createTenant,
  getCurrentUnpaid,
  getPayments,
  getPendingDues,
  getRooms,
  getTenants
} from './api'

/* =========================================================
   HELPERS
   ========================================================= */

const money = (value: any = 0) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`

const getTenantId = (tenant: any) =>
  tenant?.tenantId ?? tenant?.id

const getRoomId = (room: any) =>
  room?.roomId ?? room?.id

const getPaymentId = (payment: any) =>
  payment?.paymentId ?? payment?.id

const getRoomNumber = (tenant: any) =>
  tenant?.room?.roomNumber ??
  tenant?.roomNumber ??
  '—'

/*
  IMPORTANT FIX:

  Backend response:

  tenant
    └── room
         └── monthlyRent

  Therefore:
  tenant.room.monthlyRent

  NOT:
  tenant.monthlyRent
*/

const getTenantMonthlyRent = (tenant: any) =>
  Number(
    tenant?.room?.monthlyRent ??
    tenant?.monthlyRent ??
    0
  )

const getToday = () =>
  new Date().toISOString().slice(0, 10)

const getCurrentMonth = () =>
  new Date().toISOString().slice(0, 7)

const getPaymentMonth = (payment: any) =>
  payment?.paymentMonth ??
  payment?.month ??
  '—'

const getTenantNameFromPayment = (
  payment: any,
  tenants: any[]
) => {
  if (payment?.tenant?.name) {
    return payment.tenant.name
  }

  if (payment?.tenantName) {
    return payment.tenantName
  }

  const tenantId =
    payment?.tenantId ??
    payment?.tenant?.tenantId ??
    payment?.tenant?.id

  const tenant = tenants.find(
    t =>
      Number(getTenantId(t)) ===
      Number(tenantId)
  )

  return tenant?.name ?? 'Unknown Tenant'
}

/* =========================================================
   NAVIGATION
   ========================================================= */

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

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={<Layout />}
      />
    </Routes>
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

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64
        bg-slate-950 text-white
        transition-transform lg:translate-x-0
        ${
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

      {/* MOBILE OVERLAY */}

      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MAIN */}

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
  action?: ReactNode
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
   DASHBOARD
   ========================================================= */

function Dashboard() {

  const [tenants, setTenants] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {

    setLoading(true)

    try {

      const [
        tenantData,
        roomData,
        paymentData
      ] = await Promise.all([
        getTenants(),
        getRooms(),
        getPayments()
      ])

      setTenants(tenantData || [])
      setRooms(roomData || [])
      setPayments(paymentData || [])

    } catch (error) {

      console.error(
        'Dashboard loading error:',
        error
      )

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    load()
  }, [])

  const occupied =
    rooms.filter(
      r => r.occupied === true
    ).length

  const collected =
    payments.reduce(
      (sum, p) =>
        sum + Number(p.amount || 0),
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
   TENANTS
   ========================================================= */

function Tenants() {

  const [rows, setRows] =
    useState<any[]>([])

  const [rooms, setRooms] =
    useState<any[]>([])

  const [q, setQ] =
    useState('')

  const [show, setShow] =
    useState(false)

  const [loadingRooms, setLoadingRooms] =
    useState(false)

  const [form, setForm] =
    useState<any>({
      name: '',
      phone: '',
      email: '',
      roomId: '',
      moveInDate: getToday(),
      monthlyRent: 0
    })

  const loadTenants = async () => {

    try {

      const data =
        await getTenants()

      setRows(data || [])

    } catch (error) {

      console.error(
        'Could not load tenants:',
        error
      )

    }
  }

  const loadRooms = async () => {

    setLoadingRooms(true)

    try {

      const data =
        await getRooms()

      setRooms(data || [])

    } catch (error) {

      console.error(
        'Could not load rooms:',
        error
      )

      setRooms([])

    } finally {

      setLoadingRooms(false)

    }
  }

  const load = async () => {

    await Promise.all([
      loadTenants(),
      loadRooms()
    ])

  }

  useEffect(() => {
    load()
  }, [])

  const openTenantModal = async () => {

    setForm({
      name: '',
      phone: '',
      email: '',
      roomId: '',
      moveInDate: getToday(),
      monthlyRent: 0
    })

    setShow(true)

    await loadRooms()
  }

  const filtered =
    rows.filter(t =>
      `${t.name || ''} ${t.phone || ''} ${t.email || ''}`
        .toLowerCase()
        .includes(q.toLowerCase())
    )

  /*
    Find rooms that are already assigned
    to existing tenants.
  */

  const assignedRoomIds =
    rows
      .map(t => getRoomId(t.room))
      .filter(Boolean)
      .map(Number)

  const availableRooms =
    rooms.filter(room => {

      const id =
        Number(getRoomId(room))

      const alreadyAssigned =
        assignedRoomIds.includes(id)

      return (
        room.occupied !== true &&
        !alreadyAssigned
      )

    })

  const handleRoomChange =
    (roomId: string) => {

      if (!roomId) {

        setForm({
          ...form,
          roomId: '',
          monthlyRent: 0
        })

        return
      }

      const selectedRoom =
        rooms.find(
          r =>
            String(
              getRoomId(r)
            ) === roomId
        )

      setForm({
        ...form,
        roomId,
        monthlyRent:
          Number(
            selectedRoom?.monthlyRent || 0
          )
      })

    }

  const submit =
    async (e: FormEvent) => {

      e.preventDefault()

      if (!form.name.trim()) {

        alert(
          'Please enter tenant name.'
        )

        return
      }

      if (!form.roomId) {

        alert(
          'Please select a room.'
        )

        return
      }

      if (!form.moveInDate) {

        alert(
          'Please select move-in date.'
        )

        return
      }

      try {

        /*
          IMPORTANT:

          Backend expects:

          {
            name,
            phone,
            email,
            room: {
              roomId
            },
            moveInDate,
            monthlyRent
          }
        */

        const payload = {

          name:
            form.name.trim(),

          phone:
            form.phone.trim(),

          email:
            form.email.trim(),

          room: {
            roomId:
              Number(form.roomId)
          },

          moveInDate:
            form.moveInDate,

          monthlyRent:
            Number(
              form.monthlyRent || 0
            )
        }

        await createTenant(
          payload as any
        )

        alert(
          'Tenant registered successfully!'
        )

        setShow(false)

        setForm({
          name: '',
          phone: '',
          email: '',
          roomId: '',
          moveInDate: getToday(),
          monthlyRent: 0
        })

        await load()

      } catch (error: any) {

        console.error(
          'Tenant creation error:',
          error
        )

        console.error(
          'Backend response:',
          error?.response?.data
        )

        alert(
          error?.response?.data?.message ||
          'Could not create tenant. Check the backend endpoint.'
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
            onClick={openTenantModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Register Tenant
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border bg-white px-3">

        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          value={q}
          onChange={e =>
            setQ(e.target.value)
          }
          placeholder="Search tenant..."
          className="w-full bg-transparent py-3 text-sm outline-none"
        />

      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <Table>

          <thead>

            <tr>

              <Th>Tenant</Th>
              <Th>Phone</Th>
              <Th>Room</Th>
              <Th>Monthly Rent</Th>
              <Th>Status</Th>

            </tr>

          </thead>

          <tbody>

            {filtered.map(t => (

              <tr
                key={getTenantId(t)}
                className="border-t hover:bg-slate-50"
              >

                <Td>

                  <div className="font-semibold">
                    {t.name}
                  </div>

                  <div className="text-xs text-slate-500">
                    {t.email || '—'}
                  </div>

                </Td>

                <Td>
                  {t.phone || '—'}
                </Td>

                <Td>
                  {getRoomNumber(t)}
                </Td>

                {/* FIXED */}

                <Td>
                  {money(
                    getTenantMonthlyRent(t)
                  )}
                </Td>

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

              </tr>

            ))}

          </tbody>

        </Table>

        {!filtered.length && (
          <Empty text="No tenants found." />
        )}

      </div>

      {show && (

        <Modal
          title="Register Tenant"
          onClose={() => setShow(false)}
        >

          <form
            onSubmit={submit}
            className="space-y-4"
          >

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

            <div className="grid gap-4 sm:grid-cols-2">

              <Field label="Phone">

                <input
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

            <div className="grid gap-4 sm:grid-cols-2">

              <Field label="Room">

                <select
                  required
                  value={form.roomId}
                  onChange={e =>
                    handleRoomChange(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    {loadingRooms
                      ? 'Loading rooms...'
                      : 'Select room'}
                  </option>

                  {!loadingRooms &&
                    availableRooms.map(
                      room => {

                        const roomId =
                          getRoomId(room)

                        return (
                          <option
                            key={roomId}
                            value={roomId}
                          >
                            Room {room.roomNumber}
                            {' — '}
                            {money(
                              room.monthlyRent
                            )}
                          </option>
                        )
                      }
                    )}

                </select>

                {!loadingRooms &&
                  availableRooms.length === 0 && (

                    <p className="mt-1 text-xs text-rose-500">
                      No available rooms found.
                    </p>

                  )}

              </Field>

              <Field label="Move-in date">

                <input
                  required
                  type="date"
                  value={form.moveInDate}
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

            <Field label="Monthly rent (₹)">

              <input
                type="number"
                min="0"
                value={form.monthlyRent}
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
              onClose={() => setShow(false)}
            />

          </form>

        </Modal>

      )}

    </>
  )
}

/* =========================================================
   ROOMS
   ========================================================= */

function Rooms() {

  const [rows, setRows] =
    useState<any[]>([])

  const [show, setShow] =
    useState(false)

  const [form, setForm] =
    useState<any>({
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

  const submit =
    async (e: FormEvent) => {

      e.preventDefault()

      try {

        const payload = {

          roomNumber:
            form.roomNumber.trim(),

          roomType:
            form.type,

          monthlyRent:
            Number(form.monthlyRent)

        }

        await createRoom(
          payload as any
        )

        alert(
          'Room created successfully!'
        )

        setShow(false)

        setForm({
          roomNumber: '',
          type: 'Single',
          monthlyRent: 0
        })

        await load()

      } catch (error: any) {

        console.error(
          'Room creation error:',
          error
        )

        alert(
          error?.response?.data?.message ||
          'Could not create room. Check the backend endpoint.'
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
            onClick={() => setShow(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Room
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {rows.map(room => (

          <div
            key={getRoomId(room)}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <BedDouble size={21} />
                </div>

                <div>

                  <div className="font-bold">
                    Room {room.roomNumber}
                  </div>

                  <div className="text-xs text-slate-500">
                    {room.roomType ||
                      room.type ||
                      'Standard'}
                  </div>

                </div>

              </div>

              <Badge
                text={
                  room.occupied
                    ? 'Occupied'
                    : 'Available'
                }
                good={!room.occupied}
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

          </div>

        ))}

      </div>

      {!rows.length && (

        <div className="mt-4 rounded-2xl border bg-white p-10">
          <Empty text="No rooms found. Add your first room." />
        </div>

      )}

      {show && (

        <Modal
          title="Add Room"
          onClose={() => setShow(false)}
        >

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            <Field label="Room number">

              <input
                required
                value={form.roomNumber}
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
                value={form.type}
                onChange={e =>
                  setForm({
                    ...form,
                    type: e.target.value
                  })
                }
              >

                <option>Single</option>
                <option>Double</option>
                <option>Triple</option>
                <option>Shared</option>

              </select>

            </Field>

            <Field label="Monthly rent (₹)">

              <input
                required
                type="number"
                min="0"
                value={form.monthlyRent}
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
              onClose={() => setShow(false)}
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
    useState<any[]>([])

  const [tenants, setTenants] =
    useState<any[]>([])

  const [show, setShow] =
    useState(false)

  const [form, setForm] =
    useState<any>({
      tenantId: '',
      paymentMonth:
        getCurrentMonth(),
      amount: 0,
      paymentDate:
        getToday(),
      remarks: ''
    })

  const load = async () => {

    try {

      const [
        paymentData,
        tenantData
      ] = await Promise.all([
        getPayments(),
        getTenants()
      ])

      setRows(
        paymentData || []
      )

      setTenants(
        tenantData || []
      )

    } catch (error) {

      console.error(
        'Could not load payments:',
        error
      )

    }
  }

  useEffect(() => {
    load()
  }, [])

  const assignedTenants =
    tenants.filter(
      tenant =>
        tenant?.room?.roomId ||
        tenant?.room?.id
    )

  const openPaymentModal = () => {

    setForm({
      tenantId: '',
      paymentMonth:
        getCurrentMonth(),
      amount: 0,
      paymentDate:
        getToday(),
      remarks: ''
    })

    setShow(true)
  }

  const handleTenantChange =
    (tenantId: string) => {

      const selectedTenant =
        tenants.find(
          t =>
            Number(
              getTenantId(t)
            ) ===
            Number(tenantId)
        )

      const roomRent =
        selectedTenant?.room?.monthlyRent

      setForm({
        ...form,
        tenantId:
          Number(tenantId),
        amount:
          Number(roomRent || 0)
      })
    }

  const submit =
    async (e: FormEvent) => {

      e.preventDefault()

      if (!form.tenantId) {

        alert(
          'Please select a tenant.'
        )

        return
      }

      if (!form.paymentMonth) {

        alert(
          'Please select payment month.'
        )

        return
      }

      if (!form.paymentDate) {

        alert(
          'Please select payment date.'
        )

        return
      }

      if (
        Number(form.amount) <= 0
      ) {

        alert(
          'Please enter a valid payment amount.'
        )

        return
      }

      try {

        /*
          Correct backend payload:

          tenantId
          paymentMonth
          amount
          paymentDate
          remarks
        */

        const payload = {

          tenantId:
            Number(form.tenantId),

          paymentMonth:
            form.paymentMonth,

          amount:
            Number(form.amount),

          paymentDate:
            form.paymentDate,

          remarks:
            form.remarks || ''

        }

        await createPayment(
          payload as any
        )

        alert(
          'Payment recorded successfully!'
        )

        setShow(false)

        await load()

      } catch (error: any) {

        console.error(
          'Payment creation error:',
          error
        )

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Could not record payment. Check the backend endpoint.'

        alert(message)

      }

    }

  return (
    <>

      <PageHeader
        title="Rent Payments"
        description="Record monthly rent payments and keep a clear payment history."
        action={
          <button
            onClick={openPaymentModal}
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

            {rows.map(payment => (

              <tr
                key={getPaymentId(payment)}
                className="border-t"
              >

                <Td className="font-semibold">

                  {getTenantNameFromPayment(
                    payment,
                    tenants
                  )}

                </Td>

                <Td>
                  {getPaymentMonth(
                    payment
                  )}
                </Td>

                <Td>
                  {money(
                    payment.amount
                  )}
                </Td>

                <Td>
                  {payment.paymentDate ||
                    '—'}
                </Td>

                <Td>

                  <Badge
                    text="PAID"
                    good
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
          onClose={() => setShow(false)}
        >

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            <Field label="Tenant">

              <select
                required
                value={form.tenantId}
                onChange={e =>
                  handleTenantChange(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select tenant
                </option>

                {assignedTenants.map(
                  tenant => (

                    <option
                      key={getTenantId(
                        tenant
                      )}
                      value={getTenantId(
                        tenant
                      )}
                    >
                      {tenant.name}
                      {' — '}
                      Room{' '}
                      {getRoomNumber(
                        tenant
                      )}
                    </option>

                  )
                )}

              </select>

              {!assignedTenants.length && (

                <p className="mt-1 text-xs text-rose-500">
                  No tenants with assigned rooms.
                </p>

              )}

            </Field>

            <div className="grid gap-4 sm:grid-cols-2">

              <Field label="Month">

                <input
                  required
                  type="month"
                  value={
                    form.paymentMonth
                  }
                  onChange={e =>
                    setForm({
                      ...form,
                      paymentMonth:
                        e.target.value
                    })
                  }
                />

              </Field>

              <Field label="Amount (₹)">

                <input
                  required
                  type="number"
                  min="1"
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
                  form.remarks
                }
                onChange={e =>
                  setForm({
                    ...form,
                    remarks:
                      e.target.value
                  })
                }
              />

            </Field>

            <ModalActions
              onClose={() => setShow(false)}
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
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const load = async () => {

    setLoading(true)

    try {

      const data =
        await getPendingDues()

      setRows(data || [])

    } catch (error) {

      console.error(
        'Could not load pending dues:',
        error
      )

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
    useState<any[]>([])

  const [loading, setLoading] =
    useState(false)

  const load = async () => {

    setLoading(true)

    try {

      const data =
        await getCurrentUnpaid()

      setRows(data || [])

    } catch (error) {

      console.error(
        'Could not load unpaid tenants:',
        error
      )

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
        title="Current Month Unpaid"
        description="Tenants who have not paid for the current month."
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
   PENDING / UNPAID TABLE
   ========================================================= */

function TenantDueTable({
  rows
}: {
  rows: any[]
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

          {rows.map(tenant => (

            <tr
              key={getTenantId(tenant)}
              className="border-t"
            >

              <Td className="font-semibold">
                {tenant.name}
              </Td>

              <Td>
                {getRoomNumber(tenant)}
              </Td>

              {/* IMPORTANT FIX */}

              <Td>
                {money(
                  getTenantMonthlyRent(
                    tenant
                  )
                )}
              </Td>

              <Td>
                {tenant.moveInDate ||
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
   UI HELPERS
   ========================================================= */

function Table({
  children
}: {
  children: ReactNode
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
  children: ReactNode
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
  children: ReactNode
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

function Field({
  label,
  children
}: {
  label: string
  children: ReactNode
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

function Modal({
  title,
  onClose,
  children
}: {
  title: string
  onClose: () => void
  children: ReactNode
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
        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Save
      </button>

    </div>
  )
}