'use strict';
import { augmentTypeDefs, augmentSchema } from 'neo4j-graphql-js';
import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server';
import { v1 as neo4j } from 'neo4j-driver';
import { typeDefs, resolvers } from './data/schema';

const schema = makeExecutableSchema({
    typeDefs: augmentTypeDefs(typeDefs),
    resolverValidationOptions: {
        requireResolversForResolveType: false
    },
    resolvers
});

// Add auto-generated mutations
const augmentedSchema = augmentSchema(schema);

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://52.91.132.139',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'float-checker-chips'
    )
);

const server = new ApolloServer({
    schema: augmentedSchema,
    // inject the request object into the context to support middleware
    // inject the Neo4j driver instance to handle database call
    context: ({ req }) => {
        return {
            driver,
            req
        };
    }
});

server
    .listen(process.env.GRAPHQL_LISTEN_PORT || 3000, '0.0.0.0')
    .then(({ url }) => {
        console.log(`GraphQL API ready at ${url}`);
    });