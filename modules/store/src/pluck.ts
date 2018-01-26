import { Selector, select } from '@ngrx/store';
import { NgrxSelect } from './module';

/**
 * Provide an utility for select a piece of state from Root State.
 * Support shorthand syntax with 'dot' split property name and leave it empty
 * will use the component property name.
 * @example
 * export class MyComponent {
 *   @Pluck() prop1: Observable<any>
 *   @Pluck('feature.prop2') prop2: Observable<any>
 *   @Pluck('feature', 'prop3') prop3: Observable<any>
 * }
 */
export function Pluck<A = any, B = any>(path?: string, ...paths: string[]) {
  return function(target: any, name: string) {
    let fn: Selector<A, B>;

    if (!path) {
      path = name;
    }

    if (typeof path !== 'string') {
      throw new TypeError(
        `Unexpected type '${typeof path}' in select operator,` + ` expected 'string'`
      );
    }

    fn = getPropFactory(paths.length ? [path, ...paths] : path.split('.'));

    /**
     * Get property descriptor for more precise define object property
     */
    const descriptor = Object.getOwnPropertyDescriptor(target, name);

    if (delete target[name]) {
      Object.defineProperty(target, name, {
        get() {
          const source$ = NgrxSelect.store;

          if (!source$) {
            throw new Error('NgrxSelect not connected to store!');
          }

          return source$.pipe(select(fn));
        },
        ...descriptor
      });
    }
  };
}

function getPropFactory(paths: string[]) {
  return (state: { [prop: string]: any }) =>
    paths.reduce((prev, cur) => {
      return prev && prev[cur];
    }, state);
}