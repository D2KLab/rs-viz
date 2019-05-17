import $ from 'jquery';
import csv from 'jquery-csv';
import Popper from 'popper.js/dist/umd/popper.js';
window.Popper = Popper;
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Plotly from 'plotly.js/dist/plotly';
import {Spinner} from 'spin.js';
import _ from 'lodash';

var spinner = new Spinner();

function drawPlot(x, y, z, c) {
    let trace = {
        x: x, y: y, z: z,
        mode: 'markers',
        marker: {
            size: 1,
            opacity: 1,
            color: c,
            colorscale: 'Portland',
        },
        type: 'scatter3d'
    };
    let data = [trace];
    let layout = {
        autosize: true,
        dragmode: true,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
        scene: {
            xaxis: { title: 'User' },
            yaxis: { title: 'Item' },
            zaxis: { title: 'Count' }
        }
    };
    Plotly.newPlot('plot', data, layout, {showSendToCloud: false});
    $("#btnSubmit").attr("disabled", false);
    spinner.stop();
}

function mapIdByCount(data) {
    let ids = _(data).chain().groupBy()
        .sortBy(function (a) {
            return -a.length;
        }).map(function (a) {
            return a[0];
        }).value();

    let id = 0;
    let mapping = {};

    ids.forEach(function (value) {
        mapping[value] = id++;
    });

    let sorted = [];

    data.forEach(function (value) {
        sorted.push(mapping[value]);
    });

    return sorted;
}

function processData(data, separator, threshold, size) {
    switch (separator) {
        case "tabulation":
            separator = '\t';
            break;
        case "comma":
            separator = ',';
            break;
        case "space":
            separator = ' ';
            break;
        case "colon":
            separator = ':';
            break;
        case "doublecolon":
            separator = '::';
            break;
        case "semicolon":
            separator = ';';
            break
        default:
            separator = ',';
    } 

    let rows = csv.toArrays(data, {separator: separator})
    let users = [];
    let items = [];

    rows.forEach(function (row) {
        if (row[2] > threshold) {
            users.push(row[0]);
            items.push(row[1]);
        }
    });

    let sortedUsers = mapIdByCount(users);
    let sortedItems = mapIdByCount(items);

    let matrix = _.chunk(_.fill(Array(size * size), 0), size);

    let maxUser = _.max(sortedUsers);
    let maxItem = _.max(sortedItems);

    for (let i = 0; i < sortedUsers.length; i++) {
        let normUser = Math.floor(sortedUsers[i] / maxUser * (size - 1));
        let normItem = Math.floor(sortedItems[i] / maxItem * (size - 1));

        matrix[normUser][normItem]++;
    }

    let x = [];
    let y = [];
    let z = [];
    let c = [];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let value = matrix[i][j];

            if (value > 0) {
                x.push(i);
                y.push(j);
                z.push(value);
                c.push(Math.log(value));
            }
        }
    }

    drawPlot(x, y, z, c);
}

$(function () {
    // Create empty plot on load
    drawPlot([1], [1], [1], ['#00000000']);

    $('#dataset').change(function (event) {
        let dataset = $('#dataset').val();
        if (dataset === 'file') {
            $('#file').attr("disabled", false).attr("required", true);
            $('#separator').attr("disabled", false);
        } else {
            $('#file').attr("disabled", true).attr("required", false);
            $('#separator').attr("disabled", true);
            switch (dataset) {
                case "ml-1m":
                    $('#separator').val('doublecolon');
                    break;
                default:
                    $('#separator').val('tabulation');
            }
        }
    });

    $('#form').submit(function (event) {
        event.preventDefault();
        $("#btnSubmit").attr("disabled", true);
        spinner.spin(document.getElementById('plot'));

        let dataset = $('#dataset').val();
        let files = $('#file').prop('files');
        let separator = $('#separator').val();
        let threshold = $('#threshold').val();
        let size = $('#size').val();

        if (dataset === 'file') {
            let reader = new FileReader();
            reader.readAsText(files[0]);
            reader.onload = function (event) {
                processData(event.target.result, separator, threshold, size);
            };
        } else {
            $.get('datasets/' + dataset + '.csv' , function (data) {
                processData(data, separator, threshold, size);
            });
        }

    });
});