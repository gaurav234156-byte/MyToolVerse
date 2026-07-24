import type { Tool } from "@/data/types";
import { PdfMergeEngine } from "./engines/pdf-merge-engine";
import { PdfSplitEngine } from "./engines/pdf-split-engine";
import { PdfCompressEngine } from "./engines/pdf-compress-engine";
import { PdfRotateEngine } from "./engines/pdf-rotate-engine";
import { PdfWatermarkEngine } from "./engines/pdf-watermark-engine";
import { ImagesToPdfEngine } from "./engines/images-to-pdf-engine";
import { PdfCropEngine } from "./engines/pdf-crop-engine";
import { PdfPageNumbersEngine } from "./engines/pdf-page-numbers-engine";
import { PdfSignEngine } from "./engines/pdf-sign-engine";
import { PdfToJpgEngine } from "./engines/pdf-to-jpg-engine";
import { PdfToWordEngine } from "./engines/pdf-to-word-engine";
import { WordToPdfEngine } from "./engines/word-to-pdf-engine";
import { PdfToExcelEngine } from "./engines/pdf-to-excel-engine";
import { ProtectPdfEngine } from "./engines/protect-pdf-engine";
import { UnlockPdfEngine } from "./engines/unlock-pdf-engine";
import { PowerpointToPdfEngine } from "./engines/powerpoint-to-pdf-engine";
import { PdfToPowerpointEngine } from "./engines/pdf-to-powerpoint-engine";
import { OrganizePdfEngine } from "./engines/organize-pdf-engine";
import { ExcelToPdfEngine } from "./engines/excel-to-pdf-engine";
import { RepairPdfEngine } from "./engines/repair-pdf-engine";
import { EditPdfEngine } from "./engines/edit-pdf-engine";
import { JsonFormatterEngine } from "./engines/json-formatter-engine";
import { Base64Engine } from "./engines/base64-engine";
import { PasswordGeneratorEngine } from "./engines/password-generator-engine";
import { UuidGeneratorEngine } from "./engines/uuid-generator-engine";
import { HashGeneratorEngine } from "./engines/hash-generator-engine";
import { QrGeneratorEngine } from "./engines/qr-generator-engine";
import { CalculatorEngine } from "./engines/calculator-engine";
import { JwtDecodeEngine } from "./engines/jwt-decode-engine";
import { UrlEncodeEngine } from "./engines/url-encode-engine";
import { ImageCompressEngine } from "./engines/image-compress-engine";
import { ImageResizeEngine } from "./engines/image-resize-engine";
import { ImageConvertEngine } from "./engines/image-convert-engine";
import { ImageCropEngine } from "./engines/image-crop-engine";
import { ImageGenericEngine } from "./engines/image-generic-engine";
import { TextCounterEngine } from "./engines/text-counter-engine";
import { CaseConverterEngine } from "./engines/case-converter-engine";
import { TextDiffEngine } from "./engines/text-diff-engine";
import { TextGenericEngine } from "./engines/text-generic-engine";
import { DevGenericEngine } from "./engines/dev-generic-engine";
import { ComingSoonEngine } from "./engines/coming-soon-engine";

export function ToolEngineRenderer({ tool }: { tool: Tool }) {
  if (!tool.isLive) {
    return <ComingSoonEngine tool={tool} />;
  }

  switch (tool.engine) {
    // PDF
    case "pdf-merge":      return <PdfMergeEngine />;
    case "pdf-split":      return <PdfSplitEngine />;
    case "pdf-compress":   return <PdfCompressEngine />;
    case "pdf-rotate":     return <PdfRotateEngine />;
    case "pdf-watermark":  return <PdfWatermarkEngine />;
    case "images-to-pdf":  return <ImagesToPdfEngine />;
    case "pdf-crop":        return <PdfCropEngine />;
    case "pdf-page-numbers":return <PdfPageNumbersEngine />;
    case "pdf-sign":        return <PdfSignEngine />;
    case "pdf-to-jpg":      return <PdfToJpgEngine />;
case "pdf-to-word":    return <PdfToWordEngine />;
case "word-to-pdf":    return <WordToPdfEngine />;
case "pdf-to-excel":    return <PdfToExcelEngine />;
case "pdf-protect":    return <ProtectPdfEngine />;
    case "pdf-unlock":    return <UnlockPdfEngine />;
case "powerpoint-to-pdf":    return <PowerpointToPdfEngine />;
    case "pdf-to-powerpoint":    return <PdfToPowerpointEngine />;
    case "organize-pdf":    return <OrganizePdfEngine />;
    case "excel-to-pdf":    return <ExcelToPdfEngine />;
    case "repair-pdf":      return <RepairPdfEngine />;
    case "edit-pdf":        return <EditPdfEngine />;
    // Image
    case "image-compress": return <ImageCompressEngine />;
    case "image-resize":   return <ImageResizeEngine />;
    case "image-convert":  return <ImageConvertEngine />;
    case "image-crop":     return <ImageCropEngine />;
    case "image-generic-api": return <ImageGenericEngine slug={tool.slug} />;
    // Developer
    case "json-formatter":    return <JsonFormatterEngine />;
    case "base64-encode":     return <Base64Engine mode="encode" />;
    case "base64-decode":     return <Base64Engine mode="decode" />;
    case "password-generator":return <PasswordGeneratorEngine />;
    case "uuid-generator":    return <UuidGeneratorEngine />;
    case "hash-generator":    return <HashGeneratorEngine />;
    case "qr-generator":      return <QrGeneratorEngine />;
    case "jwt-decode":        return <JwtDecodeEngine />;
    case "url-encode":        return <UrlEncodeEngine />;
    case "dev-generic":       return <DevGenericEngine slug={tool.slug} />;
    // Calculator
    case "calculator-generic":return <CalculatorEngine slug={tool.slug} />;
    // Text
    case "text-counter":   return <TextCounterEngine slug={tool.slug} />;
    case "text-case":      return <CaseConverterEngine />;
    case "text-diff":      return <TextDiffEngine />;
    case "text-generic":   return <TextGenericEngine slug={tool.slug} />;
    // Default
    default:
      return <ComingSoonEngine tool={tool} />;
  }
}
