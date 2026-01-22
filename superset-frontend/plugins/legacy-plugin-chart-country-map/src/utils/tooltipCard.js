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
import { sanitizeHtml } from '@superset-ui/core';

export function templateTooltipHtml(template, data, style = 'default') {
  let html = template;
  html = html.replace(/\{country\}/g, escapeHtml(data.countryName));
  html = html.replace(/\{iso\}/g, escapeHtml(data.isoCode));
  html = html.replace(/\{value\}/g, escapeHtml(data.metricValue));
  html = html.replace(/\{formatted\}/g, escapeHtml(data.metricFormatted));
  html = html.replace(/\{rank\}/g, data.rank !== undefined ? String(data.rank) : '');
  
  html = formatText(html);
  
  if (style === 'minimal') {
    return '<div style="background: #1a1a1a; color: #ffffff; padding: 10px 14px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; line-height: 1.4; min-width: 100px;">' +
           html +
           '</div>';
  }
  
  return '<div style="background: #ffffff; color: #1a1a1a; padding: 14px 18px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; line-height: 1.5; max-width: 280px; border: 1px solid #e0e0e0;">' +
         html +
         '</div>';
}

function formatText(text) {
  if (!text) return '';
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\n/g, '<br/>');
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/#([^:]+):\s*/g, '<strong style="color: #666; font-weight: 600;">$1:</strong> ');
  return formatted;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
