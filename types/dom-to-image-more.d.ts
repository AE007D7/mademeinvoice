declare module 'dom-to-image-more' {
  interface Options {
    quality?: number
    scale?: number
    bgcolor?: string
    filter?: (node: Node) => boolean
    [key: string]: unknown
  }
  const domtoimage: {
    toJpeg(el: HTMLElement, options?: Options): Promise<string>
    toPng(el: HTMLElement, options?: Options): Promise<string>
    toBlob(el: HTMLElement, options?: Options): Promise<Blob>
  }
  export default domtoimage
}
