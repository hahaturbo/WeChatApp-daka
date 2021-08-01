interface ObjectInterface {
  [key: string]: any;
}
type Path = string
type Query = ObjectInterface;

interface LaunchOptions {
  path: Path;
  query: Query;
}

interface AppConfig {
  onLaunch?: (options: LaunchOptions) => void;
  onShow?: (options: {
    path: Path;
    query: Query;
  }) => void;
  onHide?: () => void;
  onError?: (msg: string) => void;
  globalData?: any;

  [key: string]: any;
}

interface PageParams {
  data?: object;
  onLoad?: (options: ObjectInterface) => void;
  onReady?: () => void;
  onShow?: () => void;
  onHide?: () => void;
  onUnload?: () => void;
  onReachBottom?: () => void;
  selectComponent?: (selector: string, callback: (res: any) => void) => void;
  is?: string;
  [key: string]: any;
}

interface PageInstance extends PageParams {
  setData: (data: ObjectInterface, callback?: () => void) => void;
}

type PropertyType =
  | typeof String
  | typeof Number
  | typeof Boolean
  | typeof Object
  | typeof Array
  | null;

interface PropertyObject<T> {
  type: PropertyType;
  value?: T;
  observer?:
    | string
    | ((this: any, newVal?: T, oldVal?: T, changedPath?: string) => void);
}

interface ComponentProperties {
  [key: string]: PropertyType | PropertyObject<any>;
}

interface ComponentParams {
  properties?: ObjectInterface;
  data?: {
    [key: string]: any;
  };
  methods: {
    [key: string]: (...args: any[]) => void;
  }
  created?: (this: any) => void;
  attached?: (this: any) => void;
  ready?: (this: any) => void;
}

interface WX {
  [key: string]: any;
}

declare const App: (config: AppConfig) => void;
declare const getApp: () => AppConfig;
declare const Page: (params: PageParams) => void;
declare const Component: (params: ComponentParams) => void;

declare const wx: WX;
