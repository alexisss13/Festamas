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
  const brandColors = {
        primary: "var(--primary)",      // Color del borde e icono
        background: "#ffffff",   // Fondo muy suave
        text: "#1e293b",         // Texto oscuro para lectura 
        border: "#e2e8f0"        // Borde sutil
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