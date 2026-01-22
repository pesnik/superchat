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
/* eslint-disable react/sort-prop-types */
import d3 from 'd3';
import PropTypes from 'prop-types';
import { extent as d3Extent } from 'd3-array';
import {
  getNumberFormatter,
  getSequentialSchemeRegistry,
  CategoricalColorNamespace,
} from '@superset-ui/core';
import countries, { countryOptions } from './countries';
import sandboxedEval from './utils/sandbox';

const propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      country_id: PropTypes.string,
      metric: PropTypes.number,
    }),
  ),
  width: PropTypes.number,
  height: PropTypes.number,
  country: PropTypes.string,
  colorScheme: PropTypes.string,
  linearColorScheme: PropTypes.string,
  mapBaseUrl: PropTypes.string,
  numberFormat: PropTypes.string,
  showLegend: PropTypes.bool,
  jsColumns: PropTypes.array,
  jsDataMutator: PropTypes.string,
};

const maps = {};

function CountryMap(element, props) {
  const {
    data: rawData,
    width,
    height,
    country,
    linearColorScheme,
    numberFormat,
    colorScheme,
    sliceId,
    showLegend,
    jsDataMutator,
  } = props;

  const container = element;
  const format = getNumberFormatter(numberFormat);

  let data = Array.isArray(rawData) ? [...rawData] : [];
  let customLegend = null;
  if (jsDataMutator) {
    try {
      const jsFnMutator = sandboxedEval(jsDataMutator);
      const result = jsFnMutator(data);
      
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        if (Array.isArray(result.data)) {
          data = result.data;
        }
        if (Array.isArray(result.legend)) {
          customLegend = result.legend;
        }
      } else if (Array.isArray(result)) {
        data = result;
      }
    } catch (error) {
      console.error('Error in js_data_mutator:', error);
      data = Array.isArray(rawData) ? [...rawData] : [];
    }
  }

  const hasColorColumn = data.length > 0 && data.some(d => d.color);

  const isValidHexColor = (color) => {
    if (!color) return false;
    return /^#([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(color);
  };

  const linearColorScale = getSequentialSchemeRegistry()
    .get(linearColorScheme)
    .createLinearScale(d3Extent(data, v => v.metric));
  const colorScale = CategoricalColorNamespace.getScale(colorScheme);

  const usingAdvancedFeatures = hasColorColumn || jsDataMutator;

  const colorMap = {};
  data.forEach(d => {
    if (hasColorColumn && d.color && isValidHexColor(d.color)) {
      colorMap[d.country_id] = d.color;
    } else if (usingAdvancedFeatures) {
      colorMap[d.country_id] = linearColorScale(d.metric);
    } else if (colorScheme) {
      colorMap[d.country_id] = colorScale(d.country_id, sliceId);
    } else {
      colorMap[d.country_id] = linearColorScale(d.metric);
    }
  });
  const colorFn = d => colorMap[d.properties.ISO] || 'none';

  const path = d3.geo.path();
  const div = d3.select(container);
  div.classed('superset-legacy-chart-country-map', true);
  div.selectAll('*').remove();
  container.style.height = `${height}px`;
  container.style.width = `${width}px`;
  const svg = div
    .append('svg:svg')
    .attr('width', width)
    .attr('height', height)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  const backgroundRect = svg
    .append('rect')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height);
  const g = svg.append('g');
  const mapLayer = g.append('g').classed('map-layer', true);
  const textLayer = g
    .append('g')
    .classed('text-layer', true)
    .attr('transform', `translate(${width / 2}, 45)`);
  const bigText = textLayer.append('text').classed('big-text', true);
  const resultText = textLayer
    .append('text')
    .classed('result-text', true)
    .attr('dy', '1em');

  let legend = null;
  if (showLegend) {
    legend = g.append('g')
      .classed('legend', true)
      .attr('transform', `translate(${width - 150}, 20)`);

    const legendTitle = legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text('Legend');

    let legendY = 20;
    const legendItemHeight = 15;

    if (customLegend && customLegend.length > 0) {
      customLegend.forEach((legendItem, i) => {
        const legendGroup = legend.append('g')
          .attr('transform', `translate(0, ${legendY + i * legendItemHeight})`);

        legendGroup.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', legendItem.color || '#ccc')
          .attr('stroke', '#999')
          .attr('stroke-width', 1);

        legendGroup.append('text')
          .attr('x', 18)
          .attr('y', 9)
          .style('font-size', '11px')
          .text(legendItem.label || '');
      });
    } else if (data.length > 0) {
      const maxItems = Math.min(10, data.length);

      data.slice(0, maxItems).forEach((d, i) => {
        const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${legendY + i * legendItemHeight})`);

        legendItem.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', colorMap[d.country_id] || '#ccc')
          .attr('stroke', '#999')
          .attr('stroke-width', 1);

        legendItem.append('text')
          .attr('x', 18)
          .attr('y', 9)
          .style('font-size', '11px')
          .text(d.country_id);

        legendItem.append('text')
          .attr('x', 80)
          .attr('y', 9)
          .style('font-size', '11px')
          .style('text-anchor', 'end')
          .text(format(d.metric));
      });

      if (data.length > maxItems) {
        legend.append('text')
          .attr('x', 0)
          .attr('y', legendY + maxItems * legendItemHeight)
          .style('font-size', '11px')
          .style('font-style', 'italic')
          .text(`... and ${data.length - maxItems} more`);
      }
    }
  }

  let centered;

  const clicked = function clicked(d) {
    const hasCenter = d && centered !== d;
    let x;
    let y;
    let k;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    if (hasCenter) {
      const centroid = path.centroid(d);
      [x, y] = centroid;
      k = 4;
      centered = d;
    } else {
      x = halfWidth;
      y = halfHeight;
      k = 1;
      centered = null;
    }

    g.transition()
      .duration(750)
      .attr(
        'transform',
        `translate(${halfWidth},${halfHeight})scale(${k})translate(${-x},${-y})`,
      );
    textLayer
      .style('opacity', 0)
      .attr(
        'transform',
        `translate(0,0)translate(${x},${hasCenter ? y - 5 : 45})`,
      )
      .transition()
      .duration(750)
      .style('opacity', 1);
    bigText
      .transition()
      .duration(750)
      .style('font-size', hasCenter ? 6 : 16);
    resultText
      .transition()
      .duration(750)
      .style('font-size', hasCenter ? 16 : 24);
  };

  backgroundRect.on('click', clicked);

  const selectAndDisplayNameOfRegion = function selectAndDisplayNameOfRegion(
    feature,
  ) {
    let name = '';
    if (feature && feature.properties) {
      if (feature.properties.ID_2) {
        name = feature.properties.NAME_2;
      } else {
        name = feature.properties.NAME_1;
      }
    }
    bigText.text(name);
  };

  const updateMetrics = function updateMetrics(region) {
    if (region.length > 0) {
      resultText.text(format(region[0].metric));
    }
  };

  const mouseenter = function mouseenter(d) {
    let c = colorFn(d);
    if (c !== 'none') {
      c = d3.rgb(c).darker().toString();
    }
    d3.select(this).style('fill', c);
    selectAndDisplayNameOfRegion(d);
    const result = data.filter(
      region => region.country_id === d.properties.ISO,
    );
    updateMetrics(result);
  };

  const mouseout = function mouseout() {
    d3.select(this).style('fill', colorFn);
    bigText.text('');
    resultText.text('');
  };

  function drawMap(mapData) {
    const { features } = mapData;
    const center = d3.geo.centroid(mapData);
    const scale = 100;
    const projection = d3.geo
      .mercator()
      .scale(scale)
      .center(center)
      .translate([width / 2, height / 2]);
    path.projection(projection);

    const bounds = path.bounds(mapData);
    const hscale = (scale * width) / (bounds[1][0] - bounds[0][0]);
    const vscale = (scale * height) / (bounds[1][1] - bounds[0][1]);
    const newScale = hscale < vscale ? hscale : vscale;

    projection.scale(newScale);
    const newBounds = path.bounds(mapData);
    projection.translate([
      width - (newBounds[0][0] + newBounds[1][0]) / 2,
      height - (newBounds[0][1] + newBounds[1][1]) / 2,
    ]);

    mapLayer
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', 'region')
      .attr('vector-effect', 'non-scaling-stroke')
      .style('fill', colorFn)
      .on('mouseenter', mouseenter)
      .on('mouseout', mouseout)
      .on('click', clicked);
  }

  const map = maps[country];
  if (map) {
    drawMap(map);
  } else {
    const url = countries[country];
    d3.json(url, (error, mapData) => {
      if (error) {
        const countryName =
          countryOptions.find(x => x[0] === country)?.[1] || country;
        d3.select(element).html(
          `<div class="alert alert-danger">Could not load map data for ${countryName}</div>`,
        );
      } else {
        maps[country] = mapData;
        drawMap(mapData);
      }
    });
  }
}

CountryMap.displayName = 'CountryMap';
CountryMap.propTypes = propTypes;

export default CountryMap;
