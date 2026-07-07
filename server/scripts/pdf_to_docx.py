#!/usr/bin/env python3
"""Convert a PDF file to DOCX using pdf2docx."""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("Uso: pdf_to_docx.py <input.pdf> <output.docx>", file=sys.stderr)
        return 2

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    if not input_path.is_file():
        print(f"Archivo de entrada no encontrado: {input_path}", file=sys.stderr)
        return 1

    if output_path.suffix.lower() != ".docx":
        print("La ruta de salida debe terminar en .docx", file=sys.stderr)
        return 1

    try:
        from pdf2docx import Converter
    except ImportError:
        print(
            "El paquete pdf2docx no está instalado. "
            "Ejecutá: pip install -r server/scripts/requirements.txt",
            file=sys.stderr,
        )
        return 1

    try:
        converter = Converter(str(input_path))
        converter.convert(str(output_path))
        converter.close()
    except Exception as error:  # noqa: BLE001 — report conversion failures to stderr
        print(f"Error al convertir PDF a DOCX: {error}", file=sys.stderr)
        return 1

    if not output_path.is_file():
        print("La conversión finalizó pero no se generó el archivo DOCX.", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
