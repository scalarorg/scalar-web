declare module '*.svg' {
  import { VFC, SVGProps } from 'react';
  const SVG: VFC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.svg?url' {
  const SVG: string;
  export default SVG;
}
