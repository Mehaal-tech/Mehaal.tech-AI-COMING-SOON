import { useContext, createContext } from 'solid-js';

function a(t, r) {
  if (t == null) throw new Error(r);
  return t;
}
const s = createContext();
createContext();
const o = () => a(useContext(s), "<A> and 'use' router primitives can be only used inside a Route."), i = () => o().navigatorFactory(), c = () => o().params;

export { c, i };
//# sourceMappingURL=routing-wKbSS_gE.mjs.map
