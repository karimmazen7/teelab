import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

import { trackMetaPageView } from "../lib/metaPixel";

function MetaPixelTracker() {
  const location = useLocation();
  const previousLocationRef = useRef("");

  useEffect(() => {
    const currentLocation = `${location.pathname}${location.search}`;

    if (location.pathname.startsWith("/admin")) {
      return;
    }

    if (previousLocationRef.current === currentLocation) {
      return;
    }

    previousLocationRef.current = currentLocation;

    trackMetaPageView();
  }, [location.pathname, location.search]);

  return null;
}

export default MetaPixelTracker;
