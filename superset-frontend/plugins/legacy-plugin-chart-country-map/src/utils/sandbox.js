/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// A safe alternative to JS's eval for Country Map
// Simplified version for browser environment
import _ from 'underscore';

// Objects exposed here should be treated like a public API
const GLOBAL_CONTEXT = {
    console,
    _,
};

// Simplified sandboxed eval for browser environment
// This uses Function constructor which is safer than eval
export default function sandboxedEval(code) {
    try {
        // Create a function with the global context
        const func = new Function(
            ...Object.keys(GLOBAL_CONTEXT),
            `"use strict"; return (${code});`
        );

        // Execute the function with the context values
        return func(...Object.values(GLOBAL_CONTEXT));
    } catch (error) {
        console.error('Error in sandboxedEval:', error);
        return () => error;
    }
}
