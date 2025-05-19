import { AllHTMLAttributes, useEffect, useRef } from "react";

function Script({ onLoad, ...props }: AllHTMLAttributes<HTMLScriptElement>) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.onload = onLoad;
  }, []);

  return <script async ref={ref} {...props} />;
}

export default Script;