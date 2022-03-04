const ui = (() => {

    // define various css class names for later use 

    const HIDE_CLS_NAME = 'hide-block' // css class for hiding elements
    const HIGH_PREDICT_CLS_NAME = 'high-predict' // css class for highlighting those having high prediciton score
    const LOW_PREDICT_CLS_NAME = 'low-predict'
    const POS_LABEL_CLS_NAME = 'pos-label' // css class for highlighting Pokemon's true types
    const NEG_LABEL_CLS_NAME = 'neg-label'
    const SMALL_WIDTH_CLS_NAME = 'small-width' //css class fro width style

    // define various DOMs for later use 

    // Stage one: First visit
    // Stage two: Getting the model
    // Stage three: Model settled
    const stageTwoContentEles = document.querySelectorAll('.stage-two-content')
    const stageThreeContentEles = document.querySelectorAll('.stage-three-content')

    const scrollToTopBtnEle = document.getElementById('scroll-top-btn')

    // "dataDescElement" describes the data used (training/validation/demo)
    // The info can be hidden for brevity
    const dataDescElement = document.getElementById('data-desc')
    const dataDescCollapseeEles = document.querySelectorAll('.data-desc-collapsee')
    const dataDescCollapserEles = document.querySelectorAll('.data-desc-collapser')

    // DOMs for how to get the model
    const modelTypeRadioEles = document.querySelectorAll('input[name="modelType"]')
    const hyperParamSelEle = document.getElementById('hyper-param')
    const startBtnEle = document.getElementById('startBtn')

    // DOMs for visualizing Stage two
    const statusElement = document.getElementById('status')
    const lossPlotHolderEle = document.getElementById('loss-canvas')
    const lossLabelElement = document.getElementById('loss-label')
    const accPlotHolderEle = document.getElementById('accuracy-canvas')
    const accuracyLabelElement = document.getElementById('accuracy-label')

    // DOMs for demo summary
    const demoSummaryTruePosEle = document.getElementById('demo-summary-true-pos-count')
    const demoSummaryFalsePosEle = document.getElementById('demo-summary-false-pos-count')
    const demoSummaryTrueNegEle = document.getElementById('demo-summary-true-neg-count')
    const demoSummaryFalseNegEle = document.getElementById('demo-summary-false-neg-count')

    // DOMs for demo display
    const demoRepoSelEle = document.getElementById('demo-repo-sel')
    const demoPokeNoSelEle = document.getElementById('demo-poke-no-sel')
    const showDemoBtnEle = document.getElementById('demo-show-btn')
    const highPredictThresholdDispEle = document.getElementById('high-predict-threshold-disp')
    const demoAreaWidthCtrlEle = document.getElementById('demo-area-width-controller')
    const demoAreaElement = document.getElementById('demo-area')

    // private variables for plotting charts
    const _lossValues = [[], []] // holding two arrays: one for training and one for validation
    const _accuracyValues = [[], []]

    // private variables for internal state management
    let _demoRepo = DEMO_DATA[0]
    let _demoPokeNos = DEMO_POKE_NO_OPTS[0].pokeNos
    let _stageTwoImgData = []

    function Init() {

        // set <select> for hyper params
        hyperParamSelEle.innerHTML = HYPER_PARAM_OPTS.map((config) => {
            return `<option value=${config.value}>${config.desc}</option>`
        }).join('')

        // set <select> for demo content
        demoRepoSelEle.innerHTML = DEMO_DATA.map((dataSource) => {
            return `<option value=${dataSource.optValue}>${dataSource.desc}</option>`
        }).join('')

        // set <select> for demo content
        demoPokeNoSelEle.innerHTML = DEMO_POKE_NO_OPTS.map((opts) => {
            return `<option value=${opts.optValue}>${opts.desc}</option>`
        }).join('')

        // create a section for data (training/validation/demo) description
        createDataDesc()

        // the data description section can be hidden
        dataDescCollapserEles.forEach((ele) => ele.addEventListener("click", (event) => {
            event.preventDefault()
            dataDescCollapseeEles.forEach((dom) => dom.classList.toggle(HIDE_CLS_NAME))

            const isNowHiding = dataDescElement.classList.contains(HIDE_CLS_NAME)

            dataDescCollapserEles.forEach((e) => e.innerHTML = isNowHiding ? '&#9660;' : '&#9650;') // the unicodes are triangles (pointing up or down)

            if (isNowHiding) {
                scrollToTopBtnEle.click()
            }
        }))

        // create a funciton for styling content width
        demoAreaWidthCtrlEle.addEventListener("click", (event) => {
            event.preventDefault()
            demoAreaElement.classList.toggle(SMALL_WIDTH_CLS_NAME)
            demoAreaWidthCtrlEle.innerHTML = demoAreaElement.classList.contains(SMALL_WIDTH_CLS_NAME) ?
                '100% view' : '700px view'
        })

        // display the system's threshold value
        highPredictThresholdDispEle.innerText = HIGH_PREDICT_THRESHOLD

        // scroll-to-top functionality
        scrollToTopBtnEle.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        })
        document.addEventListener('scroll', () => {
            scrollToTopBtnEle.classList.add('scroll-top-show')
        })
    }

    function createDataDesc() {
        const dataDescTableHeader = `<thead>
<th>Description</th>
<th>Path</th>
<th>#</th>
<th>Example</th>
</thead>`

        const getDataRepoDescHtml = (dataRepo) => {

            return dataRepo.map((dataSoure) => {

                const ext = dataSoure.ext ?? "png"

                return `<tr>
<td>${dataSoure.desc}</td>
<td><a href='${dataSoure.basePath}#.${ext}' target='_blank'>${dataSoure.basePath}#.${ext}</a></td>
<td>1 - ${dataSoure.maxPokeNo}</td>
<td><img src='${dataSoure.basePath}1.${ext}' width='64px'/></td>
</tr>`
            }).join('')
        }

        const trainingDataDescHtml = getDataRepoDescHtml(TRAIN_DATA)
        const valDataDescHtml = getDataRepoDescHtml(VAL_DATA)
        const demoDataDescHtml = getDataRepoDescHtml(DEMO_DATA)

        const dataDescHtml = `
<h4 class='data-desc-table-title'>Training:</h4>
<div class='data-desc-table-holder'>
<table class='data-desc-table'>
${dataDescTableHeader}
<tbody>${trainingDataDescHtml}</tbody>
</table>
</div>
<h4 class='data-desc-table-title'>Validation:</h4>
<div>
<table class='data-desc-table'>
${dataDescTableHeader}
<tbody>${valDataDescHtml}</tbody>
</table>
</div>
<h4 class='data-desc-table-title'>Demo:</h4>
<div>
<table class='data-desc-table'>
${dataDescTableHeader}
<tbody>${demoDataDescHtml}</tbody>
</table>
</div>
`

        dataDescElement.innerHTML = dataDescHtml
    }


    function LogStatus(message) {
        statusElement.innerText = message;
    }

    // Show the demo table using internal states "_demoRepo" and "_demoPokeNos",
    // and do prediciton as well if the "model" param is present.
    function showDemoTable(pokeData, model4Predict) {

        _stageTwoImgs = []

        const timeStamp = Date.now()

        const getDemoImgId = (index) => `my-image-${timeStamp}-${index}`

        const rtn = new Promise((resolve, reject) => {

            let imgLoadCounter = 0

            const dataSource = _demoRepo
            const pokeNoArray = _demoPokeNos

            let demoHeaderHtml = '<div class="demo-area-header"></div>'
            demoHeaderHtml += POKE_TYPES_REF.map((t) => `<div class="demo-area-header">${t}</div>`).join('')
            demoHeaderHtml = `<div class="demo-area-row">${demoHeaderHtml}</div>`

            const ext = dataSource.ext ?? "png"

            let demoBodyHtml = ''
            for (let i = 0; i < pokeNoArray.length; i++) {

                const pokeNo = pokeNoArray[i]

                const demoPokeType = pokeData.GetPokeTypeCode(pokeNo)

                const placeHolderImg = new Image()
                placeHolderImg.id = getDemoImgId(i)
                placeHolderImg.src = `sprites/items/dream-world/poke-ball.png`

                const pokeImg = new Image()

                pokeImg.onload = () => {
                    document.getElementById(getDemoImgId(i))?.src = pokeImg.src
                    
                    if (model4Predict) {
                        updateDemoPredict([getPredictionObj(pokeData, model4Predict, pokeImg, pokeNo)])
                    } else {
                        _stageTwoImgData.push({ pokeNo, pokeImg })
                    }

                    imgLoadCounter++
                    if (imgLoadCounter === pokeNoArray.length) {
                        resolve()
                    }
                }

                //"sprites/pokemon/${pokeNo}.png"
                pokeImg.src = `${dataSource.basePath}${pokeNo}.${ext}`

                let demoBodyRowHtml = `<div class="demo-area-data">${placeHolderImg.outerHTML}</div>`

                demoBodyRowHtml += POKE_TYPES_REF.map((t, ind) => {

                    const toBeUsedEleIds = getDemoPokeEleIds(pokeNo, t)

                    const trueLabelCss = demoPokeType[ind] === 1 ? POS_LABEL_CLS_NAME : NEG_LABEL_CLS_NAME
                    let predValuePlaceHolder = '--'

                    return `
<div id="${toBeUsedEleIds[0]}" class="demo-area-data ${trueLabelCss}">
    <span data-poke-type="${t}" id="${toBeUsedEleIds[1]}">${predValuePlaceHolder}</span>
</div>`
                }).join('')
                demoBodyRowHtml = `<div class="demo-area-row">${demoBodyRowHtml}</div>`

                demoBodyHtml += demoBodyRowHtml
            }

            const prevDemoAreaScrollTop = demoAreaElement.scrollTop
            demoAreaElement.innerHTML = `${demoHeaderHtml}${demoBodyHtml}`
            demoAreaElement.scrollTop = prevDemoAreaScrollTop
        })

        return rtn
    }

    // we assign specific ids to DOMs so as to find them later
    function getDemoPokeEleIds(pokeNo, pokeType) {
        return [`demo-poke-holders-${pokeType}-${pokeNo}`, `demo-poke-pred-value-${pokeType}-${pokeNo}`]
    }

    // this function updates the demo table using the provided predictions
    function updateDemoPredict(predictions) {

        for (const pred of predictions) {

            POKE_TYPES_REF.forEach((type, typeInd) => {

                const toBeUpdatedEleIds = getDemoPokeEleIds(pred.pokeNo, type)

                const pokeTypePredValue = pred.predOutput[typeInd].toFixed(2)

                const holder = document.getElementById(toBeUpdatedEleIds[0])
                //console.log(holder)

                holder?.classList.remove(HIGH_PREDICT_CLS_NAME)
                holder?.classList.remove(LOW_PREDICT_CLS_NAME)

                if (pokeTypePredValue > HIGH_PREDICT_THRESHOLD) {
                    holder?.classList.add(HIGH_PREDICT_CLS_NAME)
                } else {
                    holder?.classList.add(LOW_PREDICT_CLS_NAME)
                }

                //console.log(document.getElementById(toBeUpdatedEleIds[1]).innerText)
                document.getElementById(toBeUpdatedEleIds[1])?.innerText = pokeTypePredValue
                
            })
        }
    }

    // this function is to update the demo table during stage two.
    function PredictDemo(pokeData, model4Predict) {

        tf.tidy(() => {

            const predictions = []

            for (const { pokeNo, pokeImg } of _stageTwoImgData) {
                predictions.push(getPredictionObj(pokeData, model4Predict, pokeImg, pokeNo))
            }
            updateDemoPredict(predictions)

            updateDemoSummary()
        })
    }

    function getPredictionObj(pokeData, model4Predict, imgDom, pokeNo) {
        return tf.tidy(() => {
            const inputTensor = pokeData.GetInputTensorFromImg(imgDom).expandDims()
            const predOutput = model4Predict.predict(inputTensor).dataSync()
            //console.log({ pokeNo: pokeNo, predOutput })
            return ({ pokeNo: pokeNo, predOutput })
        })
    }

    function updateDemoSummary() {
        const truePosCount = document.querySelectorAll(`#demo-area .${POS_LABEL_CLS_NAME}.${HIGH_PREDICT_CLS_NAME}`).length
        const trueNegCount = document.querySelectorAll(`#demo-area .${NEG_LABEL_CLS_NAME}.${LOW_PREDICT_CLS_NAME}`).length
        const falsePosCount = document.querySelectorAll(`#demo-area .${NEG_LABEL_CLS_NAME}.${HIGH_PREDICT_CLS_NAME}`).length
        const falseNegCount = document.querySelectorAll(`#demo-area .${POS_LABEL_CLS_NAME}.${LOW_PREDICT_CLS_NAME}`).length

        demoSummaryTruePosEle.innerText = truePosCount
        demoSummaryTrueNegEle.innerText = trueNegCount
        demoSummaryFalsePosEle.innerText = falsePosCount
        demoSummaryFalseNegEle.innerText = falseNegCount
    }

    function resetDemoSummary() {
        demoSummaryTruePosEle.innerText = ''
        demoSummaryTrueNegEle.innerText = ''
        demoSummaryFalsePosEle.innerText = ''
        demoSummaryFalseNegEle.innerText = ''
    }

    function PlotLoss(batch, trainLoss, valLoss) {
        
        _lossValues[0].push({ x: batch, y: trainLoss })
        _lossValues[1].push({ x: batch, y: valLoss })

        tfvis.render.linechart(
            lossPlotHolderEle, { values: _lossValues, series: ['train', 'validation'] }, {
            xLabel: 'Batch #',
            yLabel: 'Loss',
            width: 400,
            height: 300,
        })
        lossLabelElement.innerText = `last train loss: ${trainLoss.toFixed(3)}`
    }

    function PlotAccuracy(batch, trainAccuracy, valAccuracy) {

        _accuracyValues[0].push({ x: batch, y: trainAccuracy });
        _accuracyValues[1].push({ x: batch, y: valAccuracy })

        tfvis.render.linechart(
            accPlotHolderEle,
            { values: _accuracyValues, series: ['train', 'validation'] }, {
            xLabel: 'Batch #',
            yLabel: 'Accuracy',
            width: 400,
            height: 300,
        });

        accuracyLabelElement.innerText = `last train accuracy: ${(trainAccuracy * 100).toFixed(2)}%`;
    }

    // obtain <select> value of model types: load pre-trained model; train a new one; etc.
    function GetModelType() {
        let rtn
        modelTypeRadioEles.forEach((ele) => {
            if (ele.checked) {
                rtn = ele.value
            }
        })
        return rtn
    }

    // obtain <select> value of hyper params: batch size; epoch; etc
    function GetHyperParam() {
        const selectValue = hyperParamSelEle.value
        return HYPER_PARAM_OPTS.find((config) => config.value === selectValue)
    }

    // obtain <select> value
    function getDemoRepo() {
        const selectValue = demoRepoSelEle.value
        return DEMO_DATA.find((dataSource) => dataSource.optValue === selectValue)
    }

    // obtain <select> value
    function getDemoPokeNoOpt() {
        const selectValue = demoPokeNoSelEle.value
        return DEMO_POKE_NO_OPTS.find((opt) => opt.optValue === selectValue)
    }

    async function StageOneHandler(pokeData) {
        replaceShowDemoCallback(async() => {
            await showDemoTable(myData)
        })

        await showDemoTable(myData)
    }

    function AddStartStageTwoCallback(callback) {

        startBtnEle.addEventListener('click', () => {
            startBtnEle.setAttribute('disabled', true)
            modelTypeRadioEles.forEach((ele) => ele.setAttribute('disabled', true))
            hyperParamSelEle.setAttribute('disabled', true)
            toggleDemoFunc(true)

            stageTwoContentEles.forEach((ele)=>ele.classList.remove(HIDE_CLS_NAME))

            callback()
        })
    }

    function StageThreeHandler(pokeData, model4Predict) {
        toggleDemoFunc(false)
        stageThreeContentEles.forEach((ele) => ele.classList.remove(HIDE_CLS_NAME))

        replaceShowDemoCallback(async() => {
            resetDemoSummary()
            await showDemoTable(pokeData, model4Predict)
            updateDemoSummary()
        })
    }

    function toggleDemoFunc(isDisable) {
        if (isDisable) {
            demoRepoSelEle.setAttribute('disabled', isDisable)
            demoPokeNoSelEle.setAttribute('disabled', isDisable)
            showDemoBtnEle.setAttribute('disabled', isDisable)
        } else {
            demoRepoSelEle.removeAttribute('disabled')
            demoPokeNoSelEle.removeAttribute('disabled')
            showDemoBtnEle.removeAttribute('disabled')
        }
        
    }

    let currentShowDemoCallBack = () => { }
    function replaceShowDemoCallback(callback) {

        showDemoBtnEle.removeEventListener('click', currentShowDemoCallBack)

        currentShowDemoCallBack = () => {
            _demoRepo = getDemoRepo()

            const demoPokeNoOpt = getDemoPokeNoOpt()
            _demoPokeNos = demoPokeNoOpt.pokeNos
            if (_demoPokeNos === undefined) {
                _demoPokeNos = []

                while (_demoPokeNos.length < demoPokeNoOpt.randomLength) {
                    const randPokeNo = Math.floor(Math.random() * (_demoRepo.maxPokeNo - 1)) + 1
                    if (!_demoPokeNos.includes(randPokeNo)) {
                        _demoPokeNos.push(randPokeNo)
                    }
                }
            }

            //console.log([_demoRepo, _demoPokeNos])

            callback()
        }

        showDemoBtnEle.addEventListener('click', currentShowDemoCallBack)
    }

    return {
        Init,
        LogStatus,
        PlotLoss,
        PlotAccuracy,
        GetModelType,
        GetHyperParam,
        PredictDemo,
        StageOneHandler,
        AddStartStageTwoCallback,
        StageThreeHandler
    }
})()