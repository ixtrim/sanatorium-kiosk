declare module 'pdfjs-dist/build/pdf' {
  const pdfjsLib: any;
  export = pdfjsLib;
}

declare module 'pdfjs-dist/build/pdf.worker?url' {
  const url: string;
  export default url;
}
