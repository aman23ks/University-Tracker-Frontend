"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Download, Loader2 } from 'lucide-react'

type ExportFormat = 'xlsx' | 'csv' | 'json'

interface ExportDialogProps {
  trigger?: React.ReactNode
  onExport: (format: ExportFormat, options: Record<string, boolean>) => Promise<void>
  columns: string[]
}

export function ExportDialog({
  trigger,
  onExport,
  columns
}: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('xlsx')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns)
  const { toast } = useToast()

  const handleExport = async () => {
    setLoading(true)
    try {
      const options = selectedColumns.reduce((acc, column) => ({
        ...acc,
        [column]: true
      }), {})

      await onExport(format, options)
      setOpen(false)
      toast({
        title: 'Export Successful',
        description: 'Your data has been exported successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleColumn = (column: string) => {
    setSelectedColumns(current =>
      current.includes(column)
        ? current.filter(c => c !== column)
        : [...current, column]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Choose your export format and customize the data you want to include.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Export Format</h4>
            <Select
              value={format}
              onValueChange={(value: ExportFormat) => setFormat(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Columns to Include</h4>
            <div className="grid grid-cols-2 gap-2">
              {columns.map(column => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={selectedColumns.includes(column)}
                    onCheckedChange={() => toggleColumn(column)}
                  />
                  <label
                    htmlFor={column}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {column}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading || selectedColumns.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}