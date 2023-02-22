import e from "just-random-integer";
function i(o, r) {
  let t = 0;
  for (; --o >= 0; )
    t = t + e(1, r);
  return t;
}
export {
  i as d
};
