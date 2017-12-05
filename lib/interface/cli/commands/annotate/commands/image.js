'use strict';

const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../../helper');
const { parseFamiliarName }                            = require('@codefresh-io/docker-reference');
const { image }                                        = require('../../../../../logic').api;

const command = 'image <id>';

const describe = 'Annotate an image:';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'Docker image full name or id',
        })
        .option('id-type', {
            describe: '',
            choices: ['docker-id', 'full-name'],
            default: 'full-name',
        })
        .option('label', {
            describe: 'annotations to add to the image',
            default: [],
            alias: 'l',
        })
        .example('$0 annotate image repo/name:tag -l coverage=75%', '# Annotate image NAME with a label')
        .example('$0 annotate image ID -l tests_passed=true', '# Annotate image ID with a label');
};

const handler = async (argv) => {
    const useFullName = argv['id-type'] === 'full-name';
    let dockerImageId = argv.id;
    const annotations = prepareKeyValueFromCLIEnvOption(argv.label);

    if (useFullName) {
        const { repository, tag } = parseFamiliarName(dockerImageId);
        dockerImageId             = await image.getDockerImageId(repository, tag);
    }

    await image.annotateImage(dockerImageId, annotations);
    console.log('annotations add successfully');
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};