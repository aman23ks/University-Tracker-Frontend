import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

interface ExportOptions {
  fileName?: string
  fileType?: 'xlsx' | 'csv' | 'json'
  sheets?: { [key: string]: any[] }
}

export async function exportData(
  data: any[],
  options: ExportOptions = {}
) {
  const {
    fileName = 'export',
    fileType = 'xlsx',
    sheets = { 'Sheet1': data }
  } = options

  try {
    switch (fileType) {
      case 'xlsx':
        return exportToExcel(sheets, fileName)
      case 'csv':
        return exportToCSV(data, fileName)
      case 'json':
        return exportToJSON(data, fileName)
      default:
        throw new Error('Unsupported file type')
    }
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

function exportToExcel(sheets: { [key: string]: any[] }, fileName: string) {
  const wb = XLSX.utils.book_new()

  Object.entries(sheets).forEach(([sheetName, data]) => {
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(
    new Blob([wbout], { type: 'application/octet-stream' }),
    `${fileName}.xlsx`
  )
}

function exportToCSV(data: any[], fileName: string) {
  const headers = Object.keys(data[0])
  const csvData = data.map(row => 
    headers.map(header => JSON.stringify(row[header])).join(',')
  )
  csvData.unshift(headers.join(','))
  const csvString = csvData.join('\n')
  
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${fileName}.csv`)
}

function exportToJSON(data: any[], fileName: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  saveAs(blob, `${fileName}.json`)
}

export async function generateReport(data: any[], templateUrl: string) {
  try {
    const response = await fetch(templateUrl)
    const template = await response.arrayBuffer()
    const workbook = XLSX.read(template, { type: 'array' })

    // Process template and inject data
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A2' })

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      'report.xlsx'
    )
  } catch (error) {
    console.error('Report generation failed:', error)
    throw error
  }
}

export function downloadFile(url: string, fileName: string) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, fileName)
    })
    .catch(error => {
      console.error('Download failed:', error)
      throw error
    })
}