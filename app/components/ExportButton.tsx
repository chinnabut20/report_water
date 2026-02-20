"use client";

import React, { useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Download, FileImage, FileText, Image as ImageIcon } from "lucide-react";

interface ExportButtonProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    fileNamePrefix?: string;
}

export const ExportButton = ({ targetRef, fileNamePrefix = "report" }: ExportButtonProps) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: "png" | "jpg" | "pdf") => {
        if (!targetRef.current) return;

        setIsExporting(true);

        try {
            // Wait for fonts and images to be fully loaded
            await document.fonts.ready;

            // Get the element dimensions
            const element = targetRef.current;
            const { scrollWidth, scrollHeight } = element;

            // Determine the capture width (force desktop width to prevent layout shifts)
            const captureWidth = Math.max(scrollWidth, 1200);
            const captureHeight = scrollHeight;

            // Generate Image
            const dataUrl = await toPng(element, {
                pixelRatio: 2, // Higher quality
                quality: 1.0,
                cacheBust: true,
                width: captureWidth,
                height: captureHeight,
                backgroundColor: '#ffffff',
                style: {
                    // Critical: Enforce fixed dimensions during capture to match desktop layout
                    width: `${captureWidth}px`,
                    height: `${captureHeight}px`,
                    minWidth: `${captureWidth}px`,
                    maxHeight: "none",
                    overflow: "visible",
                    transform: "none", // Reset any potential transforms
                },
            });

            if (format === "png" || format === "jpg") {
                const link = document.createElement("a");
                link.download = `${fileNamePrefix}.${format}`;
                link.href = dataUrl;
                link.click();
            } else if (format === "pdf") {
                const img = new Image();
                img.src = dataUrl;
                await new Promise((resolve) => (img.onload = resolve));

                const pdf = new jsPDF({
                    orientation: captureWidth > captureHeight ? "l" : "p",
                    unit: "px",
                    format: [captureWidth, captureHeight]
                });

                pdf.addImage(dataUrl, "PNG", 0, 0, captureWidth, captureHeight);
                pdf.save(`${fileNamePrefix}.pdf`);
            }
        } catch (error) {
            console.error("Export failed:", error);
            // Show specific error message for easier debugging
            alert(`เกิดข้อผิดพลาดในการดาวน์โหลด: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed top-6 right-6 z-[100] flex flex-col items-end gap-2 group print:hidden">
            {/* Main Container */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/40 shadow-2xl transition-all hover:bg-white/20 hover:scale-105">

                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport("jpg")}
                        disabled={isExporting}
                        className="flex items-center gap-1.5 bg-emerald-500/80 hover:bg-emerald-600 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                        title="Download as JPG"
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        JPG
                    </button>
                    <button
                        onClick={() => handleExport("png")}
                        disabled={isExporting}
                        className="flex items-center gap-1.5 bg-blue-500/80 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                        title="Download as PNG"
                    >
                        <FileImage className="w-3.5 h-3.5" />
                        PNG
                    </button>
                    <button
                        onClick={() => handleExport("pdf")}
                        disabled={isExporting}
                        className="flex items-center gap-1.5 bg-rose-500/80 hover:bg-rose-600 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                        title="Download as PDF"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        PDF
                    </button>
                </div>
            </div>
        </div>
    );
};