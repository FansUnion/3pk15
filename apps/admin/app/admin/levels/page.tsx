import { AdminLevelWorkbench } from '../../../components/AdminLevelWorkbench'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '关卡管理' }

export default function AdminLevelsPage() {
  return <AdminLevelWorkbench />
}
