"""Complete steps 4-6 of the pipeline using the already-trained model."""
import sys, json, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0, '.')

from ml.src.preprocessing import load_config, run_preprocessing
from ml.src.explain import (
    get_native_importances, get_permutation_importances,
    explain_single_prediction, generate_importance_report, save_importance_report
)
from ml.src.evaluate import (
    evaluate_on_test, run_error_analysis,
    generate_evaluation_report, save_evaluation_report
)
import joblib
from pathlib import Path

PROJECT_ROOT = Path('.')

print('Loading config...')
cfg = load_config('ml/configs/training_config.yaml')

print('Running preprocessing...')
data = run_preprocessing(cfg, verify_hash=False, save_splits=True)

X_train = data['X_train']
X_val = data['X_val']
X_test = data['X_test']
y_train = data['y_train']
y_val = data['y_val']
y_test = data['y_test']
feature_cols = data['feature_cols']

print('Loading trained pipeline...')
pipeline = joblib.load('ml/models/final_model.joblib')

print('Step 4: Feature importances...')
fitted_pp = pipeline.named_steps['preprocessor']
feature_names_out = list(fitted_pp.get_feature_names_out())

native_df = get_native_importances(pipeline, feature_names_out)
perm_df = get_permutation_importances(
    pipeline, X_val, y_val,
    n_repeats=10, random_state=42
)

reports_dir = Path('docs/reports')
reports_dir.mkdir(parents=True, exist_ok=True)

if native_df is not None:
    native_df.to_csv(reports_dir / 'native_importances.csv', index=False)
    print('Top native importances:')
    print(native_df[['display_name','importance']].head(10).to_string())

print()
print('Top permutation importances:')
print(perm_df[['display_name','importance_mean']].head(10).to_string())
perm_df.to_csv(reports_dir / 'permutation_importances.csv', index=False)

print('\nStep 5: Single prediction example...')
sample_X = X_test.iloc[[0]]
exp = explain_single_prediction(
    pipeline, sample_X, feature_cols,
    native_df if native_df is not None else perm_df,
    ['High', 'Low', 'Mid']
)
with open(reports_dir / 'example_explanation.json', 'w') as f:
    json.dump(exp, f, indent=2)
print('Prediction:', exp['predicted_tier'], '| Confidence:', exp['confidence'])

print('\nStep 6: Generating reports...')
class_labels = ['High', 'Low', 'Mid']
eval_results = evaluate_on_test(pipeline, X_test, y_test, class_labels)

with open('ml/models/model_metadata.json') as f:
    meta = json.load(f)
baseline_results = meta.get('baselines', {})
comparison_results = meta.get('cv_comparison', {})
tuning_results = meta.get('tuning', {})

cfg['_train_size'] = len(X_train)
cfg['_val_size'] = len(X_val)
cfg['_test_size'] = len(X_test)

error_analysis = run_error_analysis(eval_results, X_test, feature_cols)
eval_md = generate_evaluation_report(
    eval_results, error_analysis,
    comparison_results, baseline_results, tuning_results, cfg
)
save_evaluation_report(eval_md, cfg)

imp_md = generate_importance_report(native_df, perm_df, cfg)
save_importance_report(imp_md, cfg)

print()
print('=== PIPELINE COMPLETE ===')
print('Test Accuracy:    ' + str(eval_results['accuracy']))
print('Test Macro-F1:    ' + str(eval_results['f1_macro']))
print('Test Weighted-F1: ' + str(eval_results['f1_weighted']))
