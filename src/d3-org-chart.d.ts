declare module 'd3-org-chart' {
  export class OrgChart<T = any> {
    container(selector: any): this;
    data(data: T[]): this;
    nodeWidth(fn: (d: any) => number): this;
    nodeHeight(fn: (d: any) => number): this;
    childrenMargin(fn: (d: any) => number): this;
    compactMarginBetween(fn: (d: any) => number): this;
    compactMarginPair(fn: (d: any) => number): this;
    siblingsMargin(fn: (d: any) => number): this;
    nodeContent(fn: (d: { data: T; [key: string]: any }) => string): this;
    render(): this;
    fit(): this;
    expandAll(): this;
    collapseAll(): this;
    exportImg(opts?: { full?: boolean; scale?: number; onLoad?: (s: string) => void }): void;
    onNodeClick(fn: (d: T) => void): this;
    layout(layout: 'top' | 'left' | 'bottom' | 'right'): this;
    compact(compact: boolean): this;
    linkUpdate(fn: (d: any, i: number, arr: any[]) => void): this;
    nodeUpdate(fn: (d: any, i: number, arr: any[]) => void): this;
    initialZoom(zoom: number): this;
    svgWidth(w: number): this;
    svgHeight(h: number): this;
    setUpToDate(): this;
    connections(connections: any[]): this;
    connectionsUpdate(fn: any): this;
  }
}
