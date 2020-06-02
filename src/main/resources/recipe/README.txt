
This debug directory contains snapshots of the e-book as it passes through the
various stages of conversion. The stages are:

    1. input - This is the result of running the input plugin on the source
    file. Use this directory to debug the input plugin.

    2. parsed - This is the result of preprocessing and parsing the output of
    the input plugin. Note that for some input plugins this will be identical to
    the input sub-directory. Use this directory to debug structure detection,
    etc.

    3. structure - This corresponds to the stage in the pipeline when structure
    detection has run, but before the CSS is flattened. Use this directory to
    debug the CSS flattening, font size conversion, etc.

    4. processed - This corresponds to the e-book as it is passed to the output
    plugin. Use this directory to debug the output plugin.

