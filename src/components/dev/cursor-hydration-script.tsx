const installGuard = `(function(){
  if (window.__cursorHydrationGuard) return;
  window.__cursorHydrationGuard = true;
  var proto = Element.prototype;
  var setAttribute = proto.setAttribute;
  var setAttributeNS = proto.setAttributeNS;
  function isCursorRef(name) { return name === "data-cursor-ref"; }
  proto.setAttribute = function(name, value) {
    if (isCursorRef(name)) return;
    return setAttribute.call(this, name, value);
  };
  proto.setAttributeNS = function(ns, name, value) {
    if (isCursorRef(name)) return;
    return setAttributeNS.call(this, ns, name, value);
  };
  function strip(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.hasAttribute("data-cursor-ref")) root.removeAttribute("data-cursor-ref");
    var nodes = root.querySelectorAll("[data-cursor-ref]");
    for (var i = 0; i < nodes.length; i++) nodes[i].removeAttribute("data-cursor-ref");
  }
  var observer = new MutationObserver(function(records) {
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      if (record.type === "attributes") strip(record.target);
      var added = record.addedNodes;
      for (var j = 0; added && j < added.length; j++) strip(added[j]);
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-cursor-ref"]
  });
  window.__releaseCursorHydrationGuard = function() {
    observer.disconnect();
    strip(document.documentElement);
    proto.setAttribute = setAttribute;
    proto.setAttributeNS = setAttributeNS;
    delete window.__releaseCursorHydrationGuard;
  };
})();`;

const sweepGuard = `(function(){
  var nodes = document.querySelectorAll("[data-cursor-ref]");
  for (var i = 0; i < nodes.length; i++) nodes[i].removeAttribute("data-cursor-ref");
})();`;

export function CursorHydrationGuard({ position }: { position: "start" | "end" }) {
  if (process.env.NODE_ENV === "production") return null;
  return <script dangerouslySetInnerHTML={{ __html: position === "start" ? installGuard : sweepGuard }} />;
}
