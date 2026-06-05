#!/usr/bin/env node
/**
 * Scans static/videos and writes static/videos/videos-manifest.json
 * Run from repo root: node scripts/generate-video-manifest.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VIDEOS_ROOT = path.join(ROOT, 'static', 'videos');
const OUT = path.join(VIDEOS_ROOT, 'videos-manifest.json');

const LAYOUT = {
  comparisons: [
    {
      title: 'Egocentric Action Control',
      items: [
        { label: 'In-Domain', dir: 'comparisons/egocentric_action/in_domain' },
        { label: 'Real World', dir: 'comparisons/egocentric_action/real_world' },
      ],
    },
    {
      title: 'Static Scene',
      items: [
        { label: 'In-Domain', dir: 'comparisons/static_scene/in_domain' },
        { label: 'UE Scene', dir: 'comparisons/static_scene/ue_scene' },
        { label: 'Real World', dir: 'comparisons/static_scene/real_world' },
      ],
    },
    {
      title: 'Dynamic Scene',
      items: [{ label: null, dir: 'comparisons/dynamic_scene' }],
    },
  ],
  demos: [
    {
      title: 'Egocentric Action Control',
      items: [
        { label: null, dir: 'demos/egocentric_action/in_domain' },
        { label: 'Real World', dir: 'demos/egocentric_action/real_world' },
      ],
    },
    {
      title: 'Static Scene',
      items: [
        { label: 'In-Domain', dir: 'demos/static_scene/in_domain' },
        { label: 'UE Scene', dir: 'demos/static_scene/ue_scene' },
        {
          label: 'Real World',
          dir: 'demos/static_scene/real_world',
          description:
            'By constructing test data where the anchor-view image and the first ego-view frame have no visual overlap through coordinate transfer across multiple captures, we examine whether AnchorWorld can still correctly establish spatial correspondence based on pose information. Specifically, Video 1 and Video 2 in this Real World subsection use this test setting.',
        },
      ],
    },
    {
      title: 'Dynamic Text Control',
      items: [{ label: null, dir: 'demos/dynamic_text_control' }],
    },
    {
      title: 'Out-of-View Scene Evolution',
      description:
        'This section evaluates whether the model can infer scene dynamics beyond the initially observed egocentric view. Another person appears in the anchor view but is invisible from the egocentric perspective, becoming visible only after a viewpoint change by the first-person player. We alter the timing of the viewpoint transition by editing the egocentric human motion, such as deleting or duplicating a human pose segment, and examine whether the generated scene evolution remains temporally consistent. Human Action 1 and Result 1 form one paired result, while Human Action 2 and Result 2 form another.',
      items: [{ label: null, dir: 'demos/out_of_view_evolution' }],
    },
    {
      title: 'Spatial Pose Awareness',
      description:
        "This section evaluates the model's spatial pose awareness by horizontally flipping the human and anchor-view poses while keeping the anchor-view image fixed. This creates both overlapping and non-overlapping view settings, allowing us to examine whether the model can capture spatial pose relationships and retrieve appearance details from the anchor view when the poses overlap.",
      items: [{ label: null, dir: 'demos/spatial_pose_awareness' }],
    },
    {
      title: 'Third-Person Human Action Control',
      items: [{ label: null, dir: 'demos/third_person_action' }],
    },
  ],
};

function listMp4RelUrls(relDir) {
  const absDir = path.join(VIDEOS_ROOT, relDir);
  if (!fs.existsSync(absDir)) return [];
  const names = fs
    .readdirSync(absDir)
    .filter((f) => f.toLowerCase().endsWith('.mp4'))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  return names.map((name) => path.posix.join('static/videos', relDir.replace(/\\/g, '/'), name));
}

function buildSection(sectionDef) {
  const items = sectionDef.items
    .map(({ label, dir, description }) => ({
      label,
      description,
      videos: listMp4RelUrls(dir),
    }))
    .filter((item) => item.videos.length > 0);

  return {
    title: sectionDef.title,
    description: sectionDef.description,
    items,
  };
}

const manifest = {
  comparisons: LAYOUT.comparisons.map(buildSection).filter((section) => section.items.length > 0),
  demos: LAYOUT.demos.map(buildSection).filter((section) => section.items.length > 0),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT}`);
