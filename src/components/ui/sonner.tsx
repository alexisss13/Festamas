"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useUIStore } from "@/store/ui"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const { currentDivision } = useUIStore()
  const isToys = currentDivision === 'JUGUETERIA'

  // --- 🎨 CONFIGURACIÓN DE COLORES DE MARCA ---
  // Usamos hexadecimales exactos para asegurar la identidad visual
  const brandColors = isToys 
    ? {
        // Festamas (Rojo/Rose)
        primary: "#fc4b65",      // Color del borde e icono
        background: "#fff1f2",   // Fondo muy suave (Rose-50)
        text: "#881337",         // Texto oscuro para lectura (Rose-900)
        border: "#fecdd3"        // Borde sutil (Rose-200)
      }
    : {
        // FiestasYa (Rosa/Pink)
        primary: "#ec4899",      // Color del borde e icono
        background: "#fdf2f8",   // Fondo muy suave (Pink-50)
        text: "#831843",         // Texto oscuro para lectura (Pink-900)
        border: "#fbcfe8"        // Borde sutil (Pink-200)
      }

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // 1. Iconos personalizados con el color primario de la marca
      icons={{
        success: <CircleCheckIcon className="size-5" style={{ color: brandColors.primary }} />,
        info: <InfoIcon className="size-5 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-500" />,
        error: <OctagonXIcon className="size-5 text-red-600" />,
        loading: <Loader2Icon className="size-5 animate-spin text-slate-400" />,
      }}
      // 2. Inyección directa de estilos para garantizar que se apliquen
      toastOptions={{
        style: {
          backgroundColor: brandColors.background,
          color: brandColors.text,
          borderLeft: `4px solid ${brandColors.primary}`, // Borde grueso de marca
          borderTop: `1px solid ${brandColors.border}`,
          borderRight: `1px solid ${brandColors.border}`,
          borderBottom: `1px solid ${brandColors.border}`,
        },
        classNames: {
          toast: "group toast group-[.toaster]:shadow-lg font-medium",
          description: "group-[.toast]:text-slate-600 font-normal",
          actionButton: "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }