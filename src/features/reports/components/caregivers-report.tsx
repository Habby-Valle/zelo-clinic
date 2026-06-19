"use client"

import { UserCheck, Download } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { CaregiverReportData } from "../types"

interface CaregiversReportProps {
  data: CaregiverReportData[]
  loading: boolean
  onExport?: () => void
}

export function CaregiversReport({ data, loading, onExport }: CaregiversReportProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="h-4 w-4" />
          Desempenho dos Cuidadores
        </CardTitle>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado.
          </div>
        ) : (
          <>
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Cuidador</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Turnos</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Concluídos</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Cancelados</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Checklists</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((cg) => (
                    <tr key={cg.caregiverId} className="border-b last:border-0">
                      <td className="py-2 font-medium">{cg.caregiverName}</td>
                      <td className="py-2 text-right">{cg.totalShifts}</td>
                      <td className="py-2 text-right text-green-600">{cg.completedShifts}</td>
                      <td className="py-2 text-right text-red-600">{cg.cancelledShifts}</td>
                      <td className="py-2 text-right text-blue-600">{cg.completedChecklists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="caregiverName"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completedShifts" name="Turnos Concluídos" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="completedChecklists" name="Checklists" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
