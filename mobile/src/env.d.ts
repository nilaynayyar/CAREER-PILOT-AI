// Ambient declarations for mobile app environment
declare const process: {
  env: {
    [key: string]: string | undefined;
    EXPO_PUBLIC_API_URL?: string;
  };
};

declare namespace React {
  type ReactNode = any;
  type FC<P = {}> = (props: P) => any;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
}

declare module "react" {
  export const useState: <T>(initialState: T | (() => T)) => [T, (action: T | ((prevState: T) => T)) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: readonly any[]) => void;
  export type FC<P = {}> = React.FC<P>;
  export type Dispatch<A> = React.Dispatch<A>;
  export type SetStateAction<S> = React.SetStateAction<S>;
  const React: any;
  export default React;
}

declare module "react-native" {
  export const View: any;
  export const Text: any;
  export const TextInput: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const StyleSheet: any;
  export const ActivityIndicator: any;
  export const SafeAreaView: any;
  export const StatusBar: any;
  export const useWindowDimensions: () => { width: number; height: number };
}
