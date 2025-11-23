// tests/setupTests.ts
import "@testing-library/jest-dom"; // modern import
import "whatwg-fetch";
import { TextEncoder, TextDecoder } from "util";

Object.assign(global, { TextEncoder, TextDecoder });

// mock next/navigation used by components
jest.mock("next/navigation", () => ({ usePathname: () => "/" }));

// optional: mock next-auth/react if tests import it
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));
