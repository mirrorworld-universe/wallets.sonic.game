import emitter from "mitt";

type Events = {
  "connect-wallet:open": void;
  "connect-wallet:close": void;
};

export const mitt = emitter<Events>();
