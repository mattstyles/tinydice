
import {d} from 'tinydice'

export default function Docs() {
  return (
    <div>
      <h1>Docs</h1>
      <p>{d(1, 6)}</p>
    </div>
  );
}
