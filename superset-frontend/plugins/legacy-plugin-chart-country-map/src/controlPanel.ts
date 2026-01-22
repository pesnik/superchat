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
import { t, validateNonEmpty, FeatureFlag, isFeatureEnabled } from '@superset-ui/core';
import {
  ControlPanelConfig,
  D3_FORMAT_OPTIONS,
  D3_FORMAT_DOCS,
  getStandardizedControls,
  sharedControls,
} from '@superset-ui/chart-controls';
import { countryOptions } from './countries';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'select_country',
            config: {
              type: 'SelectControl',
              label: t('Country'),
              default: null,
              choices: countryOptions,
              description: t('Which country to plot the map for?'),
              validators: [validateNonEmpty],
            },
          },
        ],
        ['entity'],
        ['metric'],
        ['adhoc_filters'],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      tabOverride: 'customize',
      controlSetRows: [
        [
          {
            name: 'number_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Number format'),
              renderTrigger: true,
              default: 'SMART_NUMBER',
              choices: D3_FORMAT_OPTIONS,
              description: D3_FORMAT_DOCS,
            },
          },
        ],
        ['linear_color_scheme'],
        [
          {
            name: 'show_legend',
            config: {
              type: 'CheckboxControl',
              label: t('Show legend'),
              renderTrigger: true,
              default: false,
              description: t('Whether to display a legend for the chart'),
            },
          },
        ],
        [
          {
            name: 'map_background_color',
            config: {
              type: 'TextControl',
              label: t('Map background color'),
              renderTrigger: true,
              default: '#ffffff',
              description: t('Background color of the map (hex color code)'),
            },
          },
        ],
      ],
    },
    {
      label: t('Labels'),
      expanded: true,
      tabOverride: 'customize',
      controlSetRows: [
        [
          {
            name: 'show_labels',
            config: {
              type: 'CheckboxControl',
              label: t('Show labels'),
              renderTrigger: true,
              default: false,
              description: t('Display region labels on the map'),
            },
          },
        ],
        [
          {
            name: 'label_content',
            config: {
              type: 'SelectControl',
              label: t('Label content'),
              renderTrigger: true,
              default: 'name_metric',
              choices: [
                ['name', t('Region name only')],
                ['metric', t('Metric value only')],
                ['name_metric', t('Name and metric')],
              ],
              description: t('What to display in the label'),
            },
          },
        ],
        [
          {
            name: 'label_size',
            config: {
              type: 'TextControl',
              label: t('Label font size'),
              renderTrigger: true,
              default: 12,
              description: t('Font size for labels in pixels'),
            },
          },
        ],
        [
          {
            name: 'label_color',
            config: {
              type: 'TextControl',
              label: t('Label color'),
              renderTrigger: true,
              default: '#000000',
              description: t('Text color for labels (hex color code)'),
            },
          },
        ],
        [
          {
            name: 'label_line_height',
            config: {
              type: 'TextControl',
              label: t('Label line height'),
              renderTrigger: true,
              default: 1.2,
              description: t('Line height for multiline labels'),
            },
          },
        ],
      ],
    },
    {
      label: t('Tooltip'),
      expanded: true,
      tabOverride: 'customize',
      controlSetRows: [
        [
          {
            name: 'tooltip_type',
            config: {
              type: 'SelectControl',
              label: t('Tooltip Type'),
              default: 'card',
              choices: [
                ['none', t('None')],
                ['card', t('Card Tooltip')],
              ],
              description: t('Choose how to display information on hover'),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'tooltip_card_style',
            config: {
              type: 'SelectControl',
              label: t('Card Style'),
              default: 'default',
              choices: [
                ['default', t('White')],
                ['minimal', t('Dark')],
              ],
              description: t('Style preset for the tooltip card. White is clean and visible on light backgrounds. Dark is compact and works well on any background.'),
              renderTrigger: true,
              visibility: ({ controls }: any) =>
                controls?.tooltip_type?.value === 'card',
            },
          },
        ],
        [
          {
            name: 'tooltip_template',
            config: {
              type: 'TextAreaControl',
              label: t('Tooltip Template'),
              default: '{country}: {formatted}',
              description: t(
                'Custom tooltip content using variables and markdown-like syntax.\n\n' +
                'Variables: {country}, {iso}, {value}, {formatted}, {rank}\n\n' +
                'Markdown: **bold**, *italic*\n' +
                'New lines: Use actual line breaks\n\n' +
                'Examples:\n' +
                '• {country}: {formatted}\n' +
                '• {country}\\n**{formatted}**\\nRank: #{rank}\n' +
                '• **Region:** {country}\\n**Value:** {formatted}\\nISO: {iso}'
              ),
              height: 120,
              renderTrigger: true,
              visibility: ({ controls }: any) =>
                controls?.tooltip_type?.value === 'card',
            },
          },
        ],
      ],
    },
    {
      label: t('Advanced'),
      controlSetRows: [
        [
          {
            name: 'js_columns',
            config: {
              ...sharedControls.groupby,
              label: t('Extra Data for JS'),
              default: [],
              description: t(
                'List of extra columns made available in the data. ' +
                'Add a column named "color" with hex codes (e.g., #FF5733) to control region colors directly.',
              ),
            },
          },
        ],
        [
          {
            name: 'js_data_mutator',
            config: {
              type: 'TextAreaControl',
              // language: 'javascript',
              expanded: true,
              label: t('JavaScript Data Interceptor'),
              description: t(
                'Define a JavaScript function to modify data. ' +
                'Example: data => data.map(d => ({ ...d, color: d.metric > 1000000 ? "#d62728" : "#2ca02c" }))\n\n' +
                'For custom legend, return an object with legend data: { data: [...], legend: [{ color: "#ef4444", label: "Low (0-500)" }, ...] }',
              ),
              height: 100,
              default: '',
              renderTrigger: true,
              warning: !isFeatureEnabled(FeatureFlag.EnableJavascriptControls)
                ? t(
                  'This functionality is disabled in your environment for security reasons.',
                )
                : null,
              readOnly: !isFeatureEnabled(FeatureFlag.EnableJavascriptControls),
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    entity: {
      label: t('ISO 3166-2 Codes'),
      description: t(
        'Column containing ISO 3166-2 codes of region/province/department in your table.',
      ),
    },
    metric: {
      label: t('Metric'),
      description: t('Metric to display bottom title'),
    },
    linear_color_scheme: {
      renderTrigger: false,
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    entity: getStandardizedControls().shiftColumn(),
    metric: getStandardizedControls().shiftMetric(),
  }),
};

export default config;
