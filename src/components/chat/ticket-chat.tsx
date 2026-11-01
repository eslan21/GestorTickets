// src/components/chat/ticket-chat.tsx
"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessageAction } from "@/server/actions/tickets";
import {
  Send,
  Bot,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  User,
  Image as ImageIcon,
  X,
  Maximize2,
  Paperclip,
} from "lucide-react";

export interface ChatMessageItem {
  id: string;
  content: string;
  imageUrl?: string | null;
  type: "USER" | "SYSTEM";
  createdAt: string | Date;
  sender: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
}

interface TicketChatProps {
  ticketId: string;
  initialMessages: ChatMessageItem[];
  currentUserId: string;
}

// Función para optimizar y comprimir imágenes antes del envío
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error al decodificar la imagen"));
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1920;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === "image/png";
        if (isPng && file.size < 500 * 1024) {
          resolve(canvas.toDataURL("image/png"));
        } else {
          try {
            const webp = canvas.toDataURL("image/webp", 0.82);
            if (webp.startsWith("data:image/webp")) {
              resolve(webp);
              return;
            }
          } catch {
            // Continuar con fallback jpeg si webp no está soportado en canvas
          }
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function TicketChat({ ticketId, initialMessages, currentUserId }: TicketChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [inputContent, setInputContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Sincronizar mensajes cuando cambian las props
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Función segura de scroll que solo mueve el contenedor interno del chat, NUNCA la ventana completa
  const scrollToBottom = (force = false) => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Solo scrollear si el usuario ya está cerca del fondo (<= 120px) o si es forzado (al enviar mensaje o primer render)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (force || isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: force ? "smooth" : "auto",
      });
    }
  };

  // Scroll inicial solo una vez al montar
  useEffect(() => {
    if (isInitialMount.current) {
      scrollToBottom(true);
      isInitialMount.current = false;
    } else {
      // En actualizaciones por polling, solo hacer scroll si ya estábamos abajo del todo
      scrollToBottom(false);
    }
  }, [messages]);

  // Polling silencioso cada 6 segundos para sincronizar nuevos mensajes sin mover la página
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 6000);
    return () => clearInterval(interval);
  }, [router]);

  // Manejador de selección de imagen con compresión automática
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen no debe superar los 10MB.");
      return;
    }

    try {
      const optimized = await compressImage(file);
      setSelectedImage(optimized);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al procesar la imagen.");
    } finally {
      // Reset input
      e.target.value = "";
    }
  };

  // Soporte para pegar capturas de pantalla directamente con Ctrl+V
  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          if (file.size > 10 * 1024 * 1024) {
            alert("La imagen no debe superar los 10MB.");
            return;
          }
          try {
            const optimized = await compressImage(file);
            setSelectedImage(optimized);
          } catch (err) {
            console.error(err);
            alert("Ocurrió un error al procesar la imagen pegada.");
          }
          break;
        }
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputContent.trim() && !selectedImage) || isPending) return;

    const messageText = inputContent.trim();
    const imageToSend = selectedImage;

    setInputContent("");
    setSelectedImage(null);

    // Actualización optimista en cliente
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessageItem = {
      id: optimisticId,
      content: messageText,
      imageUrl: imageToSend,
      type: "USER",
      createdAt: new Date(),
      sender: {
        id: currentUserId,
        name: "Tú",
        email: "",
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Al enviar nuestro mensaje, forzar el scroll al fondo del chat
    setTimeout(() => scrollToBottom(true), 50);

    startTransition(async () => {
      const result = await sendChatMessageAction({
        ticketId,
        content: messageText,
        imageUrl: imageToSend,
      });

      if (!result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        alert(result.error || "Error al enviar el mensaje");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      {/* Encabezado del Chat */}
      <div className="px-6 py-4 bg-stone-50/70 dark:bg-stone-850/80 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Chat Interno & Auditoría
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">Historial en tiempo real del equipo de soporte</p>
        </div>
        <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700">
          {messages.length} eventos
        </span>
      </div>

      {/* Flujo de Mensajes con scroll contenido */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FBF9F7] dark:bg-stone-950/60"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 text-sm">
            <Bot className="w-10 h-10 mb-2 stroke-1 text-stone-400 dark:text-stone-500" />
            <p>No hay mensajes en este ticket aún.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?.id === currentUserId;
            const isSystem = msg.type === "SYSTEM";

            // Renderizado de Mensajes de Auditoría del Sistema
            if (isSystem) {
              const isDerivation = msg.content.includes("derivado");
              const isResolution =
                msg.content.includes("RESOLVED") || msg.content.includes("CLOSED");

              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="max-w-xl w-full bg-stone-100/80 dark:bg-stone-850/90 border border-stone-200 dark:border-stone-750 rounded-xl p-3 text-xs flex items-start gap-3 shadow-2xs">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 shrink-0 mt-0.5 shadow-2xs">
                      {isDerivation ? (
                        <ArrowRightLeft className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      ) : isResolution ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-medium">{msg.content}</p>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 block font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // Renderizado de Mensajes de Usuario
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                    isMe
                      ? "bg-[#C2410C] text-white"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
                  }`}
                >
                  {msg.sender?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </div>

                {/* Burbuja del mensaje */}
                <div className="flex flex-col">
                  {!isMe && (
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1 ml-1">
                      {msg.sender?.name || "Usuario"}
                    </span>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs break-words space-y-2 ${
                      isMe
                        ? "bg-[#C2410C] text-white rounded-tr-xs"
                        : "bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200/90 dark:border-stone-700 rounded-tl-xs"
                    }`}
                  >
                    {/* Imagen adjunta si existe */}
                    {msg.imageUrl && (
                      <div className="relative group overflow-hidden rounded-xl border border-black/10 dark:border-white/10 mt-1 max-w-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imageUrl}
                          alt="Adjunto de chat"
                          className="w-full max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setPreviewModalImage(msg.imageUrl || null)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewModalImage(msg.imageUrl || null)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          title="Ampliar imagen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Texto del mensaje */}
                    {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>

                  <span
                    className={`text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-mono ${
                      isMe ? "text-right mr-1" : "ml-1"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vista previa de imagen seleccionada antes de enviar */}
      {selectedImage && (
        <div className="px-4 py-2 bg-stone-100 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-750 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedImage} alt="Vista previa" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-stone-800 dark:text-stone-200 block">Imagen adjunta</span>
              <span className="text-stone-500 dark:text-stone-400 text-[11px]">Se enviará junto al mensaje</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
            title="Quitar imagen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formulario de Entrada */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
      >
        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Botón para adjuntar imagen */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-stone-500 dark:text-stone-400 hover:text-[#C2410C] dark:hover:text-orange-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors shrink-0"
          title="Adjuntar imagen (o pega con Ctrl+V)"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          onPaste={handlePaste}
          placeholder="Escribe un comentario o actualización (puedes pegar imágenes con Ctrl+V)..."
          disabled={isPending}
          className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white dark:focus:bg-stone-800 focus:border-transparent transition-all disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={(!inputContent.trim() && !selectedImage) || isPending}
          className="bg-[#C2410C] hover:bg-[#9A3412] disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 dark:disabled:text-stone-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-xs"
        >
          <span>Enviar</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Modal Lightbox para ver imágenes en tamaño completo */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-stone-300 p-1"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewModalImage}
              alt="Vista ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
