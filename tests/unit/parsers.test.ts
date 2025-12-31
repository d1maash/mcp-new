import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parseOpenAPISpec } from '../../src/parsers/openapi.js';
import { parseSwaggerSpec } from '../../src/parsers/swagger.js';

describe('OpenAPI Parser', () => {
  it('should parse petstore.yaml correctly', async () => {
    const content = await readFile(
      join(import.meta.dirname, '../fixtures/petstore.yaml'),
      'utf-8'
    );
    const endpoints = await parseOpenAPISpec(content);

    expect(endpoints).toHaveLength(5);

    const listPets = endpoints.find((e) => e.operationId === 'listPets');
    expect(listPets).toBeDefined();
    expect(listPets?.method).toBe('GET');
    expect(listPets?.path).toBe('/pets');
    expect(listPets?.parameters).toHaveLength(2);

    const createPet = endpoints.find((e) => e.operationId === 'createPet');
    expect(createPet).toBeDefined();
    expect(createPet?.method).toBe('POST');
  });

  it('should parse stripe.yaml correctly', async () => {
    const content = await readFile(
      join(import.meta.dirname, '../fixtures/stripe.yaml'),
      'utf-8'
    );
    const endpoints = await parseOpenAPISpec(content);

    expect(endpoints.length).toBeGreaterThan(10);

    const listCustomers = endpoints.find((e) => e.operationId === 'listCustomers');
    expect(listCustomers).toBeDefined();
    expect(listCustomers?.tags).toContain('customers');

    const createCharge = endpoints.find((e) => e.operationId === 'createCharge');
    expect(createCharge).toBeDefined();
    expect(createCharge?.method).toBe('POST');
  });

  it('should throw on invalid YAML', async () => {
    await expect(parseOpenAPISpec('invalid: yaml: content:')).rejects.toThrow();
  });

  it('should throw on non-OpenAPI spec', async () => {
    await expect(parseOpenAPISpec('{ "random": "json" }')).rejects.toThrow(
      'Invalid OpenAPI specification'
    );
  });
});

describe('Swagger Parser', () => {
  it('should parse a basic Swagger 2.0 spec', async () => {
    const spec = `
swagger: "2.0"
info:
  title: Test API
  version: "1.0"
paths:
  /users:
    get:
      operationId: getUsers
      summary: Get all users
      parameters:
        - name: limit
          in: query
          type: integer
      responses:
        200:
          description: Success
    post:
      operationId: createUser
      summary: Create user
      parameters:
        - name: body
          in: body
          schema:
            type: object
            properties:
              name:
                type: string
              email:
                type: string
      responses:
        201:
          description: Created
`;

    const endpoints = await parseSwaggerSpec(spec);

    expect(endpoints).toHaveLength(2);

    const getUsers = endpoints.find((e) => e.operationId === 'getUsers');
    expect(getUsers).toBeDefined();
    expect(getUsers?.method).toBe('GET');
    expect(getUsers?.parameters).toHaveLength(1);

    const createUser = endpoints.find((e) => e.operationId === 'createUser');
    expect(createUser).toBeDefined();
    expect(createUser?.method).toBe('POST');
    expect(createUser?.parameters.length).toBeGreaterThan(0);
  });

  it('should throw on non-Swagger spec', async () => {
    await expect(parseSwaggerSpec('{ "openapi": "3.0.0" }')).rejects.toThrow(
      'Invalid Swagger specification'
    );
  });
});
