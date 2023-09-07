import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";
import userEvent from "@testing-library/user-event";

const server = setupServer(
  rest.get("/api/movies", (req, res, ctx) => {
    return res(ctx.json([{ movieId: 1, title: "Test Movie" }]));
  }),
  rest.get("/api/ratings", (req, res, ctx) => {
    return res(
      ctx.json([
        { ratingId: 1, score: 2, movie: { title: "Test Movie" }, movieId: 1 },
      ])
    );
  }),
  rest.get("/api/movies/:movieId", (req, res, ctx) => {
    return res(ctx.json({ title:"Test Movie", posterPath:"some path", overview:"blah, blah, blah", movieId: 1 }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const user = userEvent.setup();

test("renders the hompage at /", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /movie ratings app/i })
  ).toBeInTheDocument();
});

describe("Test Page Navigation", () => {
  test("navigates to all movies", async () => {
    render(<App />);
    await user.click(screen.getByRole("link", { name: /all movies/i }));
    expect(
      screen.getByRole("heading", { name: /all movies/i })
    ).toBeInTheDocument();
  });
  test("navigates to the login page", async () => {
    render(<App />);
    // server.use()
    await user.click(screen.getByRole("link", { name: /log in/i }));
    expect(
      screen.getByRole("heading", { name: /log in/i })
    ).toBeInTheDocument();
  });
  test("navigates to the user ratings page", async () => {
    render(<App />);
    await user.click(screen.getByRole("link", { name: /your ratings/i }));
    expect(
      screen.getByRole("heading", { name: /your ratings/i })
    ).toBeInTheDocument();
  });
  test("navigates to a movie detail page", async () => {
    render(<App />);
    await user.click(screen.getByRole("link", { name: /all movies/i }));
    await user.click(screen.getByRole("link", { name: /test movie/i }));
    expect(screen.getByRole("heading", { name: /test movie/i })).toBeInTheDocument();
  });
});

describe("test Login", () => {
  test("logging in redirects to ratings page", async () => {
    server.use(
      rest.post("/api/auth", (req, res, ctx) => {
        return res(ctx.json({ success: true }));
      })
    );
    render(<App />);
    await user.click(screen.getByRole('link', {name: /log in/i}))
    await user.type(screen.getByRole('textbox', {name: /email:/i}), 'user1@test.com')
    await user.type(screen.getByLabelText(/password:/i), 'test')
    await user.click(screen.getByRole('button', {name: /log in/i}))
    expect(screen.getByRole("heading", { name: /your ratings/i })).toBeInTheDocument();
  });
});
describe("tests create rating", () => {
  test("creating a rating redirects to ratings page", async () => {
    server.use(
      rest.post("/api/ratings", (req, res, ctx) => {
        return res(ctx.json({ ratingId: 1, score: 2}));
      })
    );
    render(<App />);
     user.click(screen.getByRole("link", { name: /all movies/i }));
    await user.click(screen.getByRole('link', {name: /all movies/i}))
     fireEvent.change(screen.getByRole('combobox', {name: /score:/i}), {target: {value: '1'}})
    await user.click(screen.getByRole('button', {name: /submit/i}))
    expect(screen.getByRole("heading", { name: /your ratings/i })).toBeInTheDocument();
  });
});

// test.todo('creating a rating redirects to user ratings page', async () => {});
