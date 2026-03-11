import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rrqenxnibtdhtgzykefn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycWVueG5pYnRkaHRnenlrZWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTk3NjYsImV4cCI6MjA4ODU3NTc2Nn0.g_5bKEZmZHCQOwlPuJilRfq2DEaOEq8oOtv2nr2Rr1E'
)

export default function App() {
  return (
    <div style={{color:'white',background:'#04111F',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700}}>
      🏔 Nepal Solution — Connected!
    </div>
  )
}
