ui.Init()

let myData = new PokeData()

// Stage one: First visit
// Stage two: Getting the model
// Stage three: Model settled
myData.Init().then(() => {
    ui.StageOneHandler(myData) 
})

ui.AddStartStageTwoCallback(async () => {
    ui.LogStatus('Loading Pokemon data...');
    const [trainDataSet, valDataSet] = await loadMyData()

    ui.LogStatus('Creating model...')
    let model
    const modelType = ui.GetModelType()
    if (modelType === 'modelTypeLoad') {
        model = await tf.loadLayersModel(PRE_TRAINED_MODEL_PATH)
        model.summary() // console.log the model def

        /* Can also log the model def in the following way:*/
        // let modelDefDesc = ''
        // model.summary(null, null, (message)=> modelDefDesc += message + "<br/>");
        // someDom.innerHTML = modelDefDesc

        ui.LogStatus('Model settled.')
        await ui.PredictDemo(myData, model)
        
    } else if (isModelTypeExtraTrain()) {

        model = await tf.loadLayersModel(PRE_TRAINED_MODEL_PATH)
        model.summary()

        ui.LogStatus('Warming up. Please wait...')
        await doTraining(model, trainDataSet, valDataSet, () => ui.PredictDemo(myData, model))
        ui.LogStatus('Model settled.')

        if (IS_DOWNLOAD_MODEL_AFTER_TRAINING) {
            await downloadModel(model)
        }

    } else {

        model = getModelDef(MODEL_CAPACITY)
        model.summary()

        ui.LogStatus('Warming up. Please wait...')
        await doTraining(model, trainDataSet, valDataSet, () => ui.PredictDemo(myData, model));
        ui.LogStatus('Model settled.')

        if (IS_DOWNLOAD_MODEL_AFTER_TRAINING) {
            await downloadModel(model)
        }
    }

    ui.StageThreeHandler(myData, model)
})

function isModelTypeExtraTrain() {
    return ui.GetModelType() === 'modelTypeExtraTrain'
}

function getModelHyperParams() {
    return isModelTypeExtraTrain() ?
        HYPER_PARAM_FOR_EXTRA_TRAIN : ui.GetHyperParam()
}

async function downloadModel(model) {
    await model.save(`downloads://my-trained-model-${Date.now()}`)
}

async function loadMyData() {

    return tf.tidy(() => {
        const myTrainDataGenerator = tf.data.generator(myData.GetTrainData)
        const myValDataGenerator = tf.data.generator(myData.GetValData)
        /*
        await myGeneratorDataset.forEachAsync((e) => {
            console.log(e)
            e.ys.print()
        })
        */

        /*
        const batchData = myGeneratorDataset.batch(4)
        batchData.forEachAsync(
            e => console.log(e))
    
        let rtn = await batchData.take(1).toArray()
        console.log(rtn)*/

        const hyperParams = getModelHyperParams()

        const trainData = myTrainDataGenerator.shuffle(hyperParams.noOfXsPerBatch * 2).batch(hyperParams.noOfXsPerBatch).repeat() // myTrainDataGenerator.batch(NO_OF_XS_PER_BATCH).repeat()
        const valData = myValDataGenerator.batch(hyperParams.noOfXsPerBatch/2).repeat()
        return [trainData, valData]
    })
}

const getModelDef = (capacityLv = 0) => {
    const rtn = tf.sequential()

    rtn.add(tf.layers.conv2d({
        inputShape: [IMAGE_PROCESS_H, IMAGE_PROCESS_W, 3],
        kernelSize: 3,
        filters: 64,
        activation: 'relu'
    }))

    rtn.add(tf.layers.dropout({ rate: 0.25 }))

    rtn.add(tf.layers.maxPooling2d({
        poolSize: 2,
        strides: 2
    }))

    rtn.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 32,
        activation: 'relu'
    }))

    rtn.add(tf.layers.maxPooling2d({
        poolSize: 2,
        strides: 2
    }))

    rtn.add(tf.layers.dropout({ rate: 0.25 }))

    if (capacityLv > 0) {
        rtn.add(tf.layers.conv2d({
            kernelSize: 3,
            filters: 32,
            activation: 'relu'
        }))

        rtn.add(tf.layers.maxPooling2d({
            poolSize: 2,
            strides: 2
        }))

        rtn.add(tf.layers.conv2d({
            kernelSize: 3,
            filters: 32,
            activation: 'relu'
        }))
    }

    rtn.add(tf.layers.flatten({}))

    rtn.add(tf.layers.dense({
        units: 64,
        kernelRegularizer: tf.regularizers.l2(),
        //activityRegularizer: 'l1l2',
        activation: 'relu'
    }))

    rtn.add(tf.layers.dropout({ rate: 0.25 }))

    rtn.add(tf.layers.dense({
        units: POKE_TYPES_REF.length,
        activation: 'sigmoid'// 'softmax' //'sigmoid'
    }))

    return rtn
}

const doTraining = async (model, trainDataSet, valDataSet, iterEndHandler) => {

    model.compile({
        optimizer: 'adam',//tf.train.adam(0.0001), //'rmsprop', //'sgd', //'adam',
        loss: 'binaryCrossentropy', //'categoricalCrossentropy' //'binaryCrossentropy',
        metrics: ['binaryAccuracy']
    })

    const hyperParams = getModelHyperParams()

    const totalNoOfBatches = NO_OF_BATCHES_PER_EPOCH * hyperParams.noOfEpoch

    let finishedBatchCount = 0

    const fitDatasetArgs = {
        batchesPerEpoch: NO_OF_BATCHES_PER_EPOCH,
        epochs: hyperParams.noOfEpoch,
        validationData: valDataSet,
        validationBatches: NO_OF_VAL_BATCHES_PER_EPOCH,
        callbacks: {
            onBatchEnd: async (batch, logs) => {
                finishedBatchCount++

                ui.LogStatus(
                    `Training... (${(finishedBatchCount / totalNoOfBatches * 100).toFixed(1)}% complete).` +
                    ` To stop training, refresh or close page.`)

                devLog({ ...logs})

                if (iterEndHandler && batch % 1 === 0) {
                    iterEndHandler()
                }

                if (batch % 10 === 0) {
                    devLog(`# of tensors: ${tf.memory().numTensors}`)
                    //console.log({ ...tf.memory() })
                }

                await tf.nextFrame()
            },
            onEpochEnd: async (epoch, logs) => {

                if (epoch === hyperParams.noOfEpoch) {
                    finalValAcc = logs.val_acc
                }

                ui.PlotLoss(finishedBatchCount, logs.loss, logs.val_loss)
                //ui.PlotAccuracy(finishedBatchCount, logs.binaryAccuracy, logs.val_binaryAccuracy)

                devLog(`############------------------- EPOCH ${epoch}--------------------------#################`)

                if (iterEndHandler) {
                    iterEndHandler()
                }
                await tf.nextFrame()
            }
        }
    }

    await model.fitDataset(trainDataSet, fitDatasetArgs)
}