import { AppProvider } from './context/AppProvider';
import { SkipLink } from './components/layout';
import Foundation from './dev/Foundation';

/**
 * Composition root. App.jsx only ever assembles — layers, providers and the
 * section order. No section logic, no animation, no markup of its own.
 *
 * Layer order (bottom → top):
 *   .stage    one persistent WebGL canvas for the whole session  [phase 4]
 *   .content  all scrolling DOM
 *   overlays  navigation, menu, cursor, preloader                [phases 3/8/9]
 */
export default function App() {
  return (
    <AppProvider>
      <SkipLink />
      <main id="main" className="content">
        <Foundation />
      </main>
    </AppProvider>
  );
}
