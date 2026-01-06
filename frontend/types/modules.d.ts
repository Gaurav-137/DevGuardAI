// Module declarations for external packages

declare module 'react' {
  interface FC<P = {}> {
    (props: P): JSX.Element | null;
  }
  
  function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  const StrictMode: FC<{ children?: any }>;
  function cloneElement(element: any, props?: any, ...children: any[]): any;
  
  interface ReactElement<P = any, T = any> {
    type: T;
    props: P;
    key: string | null;
  }
  
  const React: {
    FC: typeof FC;
    useState: typeof useState;
    useEffect: typeof useEffect;
    StrictMode: typeof StrictMode;
    cloneElement: typeof cloneElement;
  };
  
  export = React;
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export const Fragment: any;
}

declare module 'react/jsx-dev-runtime' {
  export function jsxDEV(type: any, props: any, key?: any): any;
  export const Fragment: any;
}

declare module 'react-dom/client' {
  export interface Root {
    render(element: any): void;
  }
  
  export function createRoot(container: Element | DocumentFragment): Root;
}

declare module 'react-router-dom' {
  import { FC } from 'react';
  
  export const HashRouter: FC<{ children?: any }>;
  export const Routes: FC<{ children?: any }>;
  export const Route: FC<{ path?: string; element?: any }>;
  export const Navigate: FC<{ to: string; replace?: boolean }>;
  export const NavLink: FC<{ 
    to: string; 
    className?: string | ((props: { isActive: boolean }) => string);
    children?: any;
  }>;
  export function useParams<T = {}>(): T;
}

declare module 'lucide-react' {
  import { ComponentType } from 'react';
  export const Users: ComponentType<any>;
  export const BarChart3: ComponentType<any>;
  export const PlusCircle: ComponentType<any>;
  export const Lightbulb: ComponentType<any>;
  export const ShieldCheck: ComponentType<any>;
  export const Settings: ComponentType<any>;
  export const LineChart: ComponentType<any>;
  export const HelpCircle: ComponentType<any>;
  export const Save: ComponentType<any>;
  export const ClipboardList: ComponentType<any>;
  export const CheckCircle2: ComponentType<any>;
  export const History: ComponentType<any>;
  export const AlertCircle: ComponentType<any>;
  export const Edit3: ComponentType<any>;
  export const Trash2: ComponentType<any>;
  export const Calendar: ComponentType<any>;
  export const Clock: ComponentType<any>;
  export const TrendingUp: ComponentType<any>;
  export const CheckSquare: ComponentType<any>;
  export const AlertTriangle: ComponentType<any>;
  export const GitCommit: ComponentType<any>;
  export const Sparkles: ComponentType<any>;
  export const RefreshCw: ComponentType<any>;
  export const GitPullRequest: ComponentType<any>;
  export const UserPlus: ComponentType<any>;
  export const Search: ComponentType<any>;
  export const ChevronRight: ComponentType<any>;
  export const Mail: ComponentType<any>;
  export const Briefcase: ComponentType<any>;
  export const X: ComponentType<any>;
  export const ShieldAlert: ComponentType<any>;
  export const Zap: ComponentType<any>;
  export const BarChart2: ComponentType<any>;
  export const Activity: ComponentType<any>;
  export const Download: ComponentType<any>;
  export const Sun: ComponentType<any>;
  export const Moon: ComponentType<any>;
  export const User: ComponentType<any>;
  export const LogOut: ComponentType<any>;
}

declare module 'recharts' {
  export const LineChart: any;
  export const Line: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const ResponsiveContainer: any;
  export const BarChart: any;
  export const Bar: any;
  export const AreaChart: any;
  export const Area: any;
  export const Legend: any;
  export const ComposedChart: any;
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};