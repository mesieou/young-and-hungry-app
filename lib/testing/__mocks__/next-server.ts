class MockResponse {
  status: number;
  headers: Headers;
  private body: unknown;

  constructor(body: unknown, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status ?? 200;
    this.headers = new Headers(init?.headers);
  }

  async json() {
    return this.body;
  }

  async text() {
    return typeof this.body === "string" ? this.body : JSON.stringify(this.body);
  }
}

export class NextResponse extends MockResponse {
  static json(body: unknown, init?: ResponseInit) {
    return new MockResponse(body, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {})
      }
    });
  }
}

export class NextRequest {}
